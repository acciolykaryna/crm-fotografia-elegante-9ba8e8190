import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { client_id, content } = await req.json()
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, phone, tenant_id')
      .eq('id', client_id)
      .single()

    if (clientError || !client) throw new Error('Client not found')
    if (!client.phone) throw new Error('Client has no phone number')

    const { data: tenantData } = await supabase
      .from('tenants')
      .select('whatsapp_config')
      .eq('id', client.tenant_id)
      .single()

    let WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    let WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

    if (tenantData?.whatsapp_config) {
      const config = tenantData.whatsapp_config as any
      if (config.accessToken) WHATSAPP_ACCESS_TOKEN = config.accessToken
      if (config.phoneNumberId) WHATSAPP_PHONE_NUMBER_ID = config.phoneNumberId
    }

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials not configured')
    }

    let phone = client.phone.replace(/\D/g, '')
    if (!phone.startsWith('55') && phone.length <= 11) {
      phone = '55' + phone
    }

    const res = await fetch(
      `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: content },
        }),
      },
    )

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error?.message || 'Failed to send WhatsApp message')
    }

    const messageId = data.messages?.[0]?.id

    const { error: insertError } = await supabase.from('whatsapp_messages').insert({
      tenant_id: client.tenant_id,
      client_id: client.id,
      content: content,
      direction: 'outbound',
      status: 'sent',
      whatsapp_id: messageId,
    })

    if (insertError) {
      console.error('Insert error:', insertError)
      throw new Error('Error saving message in DB')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
