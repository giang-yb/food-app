import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ""
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
    // We will retrieve the configured API token. It can be set via `supabase secrets set SEPAY_API_TOKEN=your_token`
    const SEPAY_API_TOKEN = Deno.env.get('SEPAY_API_TOKEN')

    if (!SEPAY_API_TOKEN) {
      console.error('SEPAY_API_TOKEN secret is not set in Supabase Edge Function environment variables');
      return new Response(JSON.stringify({ error: 'Configuration error: SEPAY_API_TOKEN is missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. Verify Authorization Header from SePay
    // SePay sends: "Authorization: Apikey <token>"
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || authHeader !== `Apikey ${SEPAY_API_TOKEN}`) {
      console.warn('Unauthorized request attempt or invalid SePay token', authHeader);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 2. Parse payload
    const payload = await req.json()
    console.log('Received SePay Webhook Payload:', JSON.stringify(payload))

    const { content, transferAmount, transferType } = payload

    // Process only incoming transactions (money received)
    if (transferType !== 'in') {
      console.info('Ignored non-incoming transaction type:', transferType)
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Ignored non-incoming transaction' 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (!content) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Missing content field in payload, ignored' 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 3. Extract Order Code from Content using regex
    // Support matching "ORD-XXXX" where XXXX is any sequence of digits (e.g. ORD-177942255, ORD177942255, ORD 177942255)
    const orderCodeMatch = content.match(/ORD[- ]?(\d+)/i)
    if (!orderCodeMatch) {
      console.warn('No valid Order Code (ORD-xxx) found in transfer content:', content)
      
      // If it's a test run or mock transaction from SePay dashboard (e.g. description or content contains "thu nghiem")
      // we return success: true so the SePay dashboard shows "Thành công" (Successful Setup)
      const isTest = content.toLowerCase().includes('thu nghiem') || 
                     content.toLowerCase().includes('test') ||
                     (payload.description && payload.description.toLowerCase().includes('thu nghiem'))
      
      if (isTest) {
        console.info('SePay test/mock transaction detected. Returning success: true.')
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'SePay Webhook test transaction verified successfully' 
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      // Return 200 {"success": true} for other non-order transactions to prevent SePay from endlessly retrying unrecognized transfers
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Ignored: No order code pattern found' 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Standardize to database format: ORD-XXXX (e.g., ORD-123456)
    const matchedDigits = orderCodeMatch[1]
    const orderCode = `ORD-${matchedDigits}`

    console.info(`Found matched order code: ${orderCode} in transfer memo: "${content}"`)

    // 4. Connect to Supabase DB using Service Role Key to bypass RLS policies
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 5. Query the order by order_code from database
    const { data: order, error: fetchError } = await supabaseClient
      .from('orders')
      .select('id, total_amount, status, order_code')
      .eq('order_code', orderCode)
      .single()

    if (fetchError || !order) {
      console.error(`Order Code ${orderCode} not found in database:`, fetchError)
      return new Response(JSON.stringify({ error: `Order with code ${orderCode} not found` }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.info(`Fetched Order details: ID=${order.id}, Code=${order.order_code}, total_amount=${order.total_amount}, current_status=${order.status}`)

    // 6. If the order is already confirmed, return success immediately to prevent double processing
    if (order.status === 'confirmed') {
      console.info(`Order ${orderCode} is already confirmed. Ignoring.`)
      return new Response(JSON.stringify({ success: true, message: `Order ${orderCode} was already paid and confirmed` }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 7. Verify transfer amount matches order amount
    const transferAmountNum = Number(transferAmount)
    const orderAmountNum = Number(order.total_amount)

    if (isNaN(transferAmountNum) || transferAmountNum < orderAmountNum) {
      console.warn(`Insufficient transfer amount for Order ${orderCode}: Expected >= ${orderAmountNum}, Received ${transferAmountNum}`)
      return new Response(JSON.stringify({ error: `Insufficient transfer amount. Expected ${orderAmountNum}, got ${transferAmount}` }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 8. Update order status to 'confirmed' and payment_status to 'paid' using order_code
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        status: 'confirmed',
        payment_status: 'paid'
      })
      .eq('order_code', orderCode)

    if (updateError) {
      console.error(`Failed to update Order ${orderCode} status to confirmed:`, updateError)
      return new Response(JSON.stringify({ error: 'Failed to update order status' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.info(`Successfully updated Order ${orderCode} status to 'confirmed' via SePay Webhook.`)

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Order ${orderCode} successfully paid and status updated to confirmed` 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (err: any) {
    console.error('Unhandled webhook error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
