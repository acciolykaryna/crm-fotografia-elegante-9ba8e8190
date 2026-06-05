import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const url = new URL(req.url)

  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN')

    if (mode === 'subscribe') {
      if (token === VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 })
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const { data: tenants } = await supabase.from('tenants').select('whatsapp_config')
      const isValid = tenants?.some((t: any) => t.whatsapp_config?.verifyToken === token)

      if (isValid) {
        return new Response(challenge, { status: 200 })
      }
      return new Response('Forbidden', { status: 403 })
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()

      if (body.object === 'whatsapp_business_account') {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.value.messages) {
              for (const message of change.value.messages) {
                if (message.type !== 'text') continue

                const from = message.from
                const whatsapp_id = message.id
                const text = message.text?.body || ''
                const timestamp = new Date(parseInt(message.timestamp) * 1000).toISOString()

                const phoneToSearch = from.replace(/\D/g, '')

                const { data: clients } = await supabase
                  .from('clients')
                  .select('id, tenant_id, phone')

                const client = clients?.find((c) => {
                  if (!c.phone) return false
                  const p = c.phone.replace(/\D/g, '')
                  return p.includes(phoneToSearch) || phoneToSearch.includes(p)
                })

                if (client) {
                  await supabase.from('whatsapp_messages').insert({
                    tenant_id: client.tenant_id,
                    client_id: client.id,
                    content: text,
                    direction: 'inbound',
                    status: 'received',
                    whatsapp_id: whatsapp_id,
                    created_at: timestamp,
                  })
                }
              }
            }

            if (change.value.statuses) {
              for (const statusObj of change.value.statuses) {
                await supabase
                  .from('whatsapp_messages')
                  .update({ status: statusObj.status })
                  .eq('whatsapp_id', statusObj.id)
              }
            }
          }
        }
      }
      return new Response('OK', { status: 200 })
    } catch (error: any) {
      console.error('Webhook error:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
  }

  return new Response('Method not allowed', { status: 405 })
})
