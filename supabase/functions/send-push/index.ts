import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"
import webpush from "npm:web-push"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de peticiones CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recipient_user_id, recipient_client_id, title, body, url } = await req.json()

    // 1. Instanciar cliente de Supabase con Service Role Key para evadir RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Buscar las suscripciones registradas del destinatario
    let query = supabaseClient.from('push_subscriptions').select('*')
    if (recipient_user_id) {
      query = query.eq('user_id', recipient_user_id)
    } else if (recipient_client_id) {
      query = query.eq('client_id', recipient_client_id)
    } else {
      throw new Error('Falta especificar recipient_user_id o recipient_client_id en el cuerpo.')
    }

    const { data: subs, error } = await query
    if (error) throw error

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'Sin suscripciones registradas' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Configurar detalles de firma VAPID
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') || 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEyfLug3vqRrPXzkboBUh_dWi5QwGz5Lo0-GpCJnTh57bLy-OOncrDzPBD-llhq0kndYkvWwuxQ4yF8fF8CaaX3A'
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') || 'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgBk8eDsMyilhTXyziXESmlodq8-jZsP5DbMRcAltdlsqhRANCAATJ8u6De-pGs9fORugFSH91aLlDAbPkujT4akImdOHntsvL446dysPM8EP6WWGrSSd1iS9bC7FDjIXx8XwJppfc'

    webpush.setVapidDetails(
      'mailto:soporte@fitleader.com',
      vapidPublicKey,
      vapidPrivateKey
    )

    const payload = JSON.stringify({
      title: title || 'FitLeader',
      body: body || '',
      url: url || '/',
      icon: '/logo.png',
      badge: '/logo.png'
    })

    // 4. Enviar peticiones push a cada dispositivo
    const sendPromises = subs.map((sub: any) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      }
      return webpush.sendNotification(pushSubscription, payload)
        .catch(async (err: any) => {
          console.error(`Fallo de entrega en endpoint: ${sub.endpoint}`, err)
          // 5. Limpieza automática si el token del dispositivo expiró (410 Gone / 404 Not Found)
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabaseClient.from('push_subscriptions').delete().eq('id', sub.id)
            console.log(`Suscripción expirada removida: ${sub.id}`)
          }
        })
    })

    await Promise.all(sendPromises)

    return new Response(JSON.stringify({ success: true, count: subs.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    console.error("Error en Edge Function send-push:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
