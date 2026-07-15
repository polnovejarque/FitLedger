import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEyfLug3vqRrPXzkboBUh_dWi5QwGz5Lo0-GpCJnTh57bLy-OOncrDzPBD-llhq0kndYkvWwuxQ4yF8fF8CaaX3A';

// Helper para convertir la clave pública VAPID a Uint8Array
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Suscribir al usuario (coach o atleta) a las notificaciones Push
export async function subscribeToPush(userId?: string | null, clientId?: number | null) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Web Push no está soportado en este navegador/dispositivo.');
        return null;
    }

    try {
        // 1. Registrar y esperar a que el Service Worker esté listo
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // 2. Solicitar permiso
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('Permiso para recibir notificaciones denegado.');
            return null;
        }

        // 3. Obtener suscripción del Push Manager de la PWA
        const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        };

        const subscription = await registration.pushManager.subscribe(subscribeOptions);

        // 4. Guardar los datos en Supabase
        const subJson = subscription.toJSON();
        if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
            const { error } = await supabase
                .from('push_subscriptions')
                .upsert({
                    user_id: userId || null,
                    client_id: clientId || null,
                    endpoint: subJson.endpoint,
                    p256dh: subJson.keys.p256dh,
                    auth: subJson.keys.auth
                }, { onConflict: 'endpoint' });

            if (error) {
                console.error('Error al guardar suscripción push en Supabase:', error.message);
            } else {
                console.log('Suscripción Push de FitLeader guardada con éxito. ✅');
            }
        }
        return subscription;
    } catch (err) {
        console.error('Error al registrar notificaciones push:', err);
        return null;
    }
}

// Disparar una notificación push llamando a la Edge Function
export async function sendPushNotification(
    recipientUserId: string | null,
    recipientClientId: number | null,
    title: string,
    body: string,
    url: string = '/'
) {
    try {
        const { data, error } = await supabase.functions.invoke('send-push', {
            body: {
                recipient_user_id: recipientUserId,
                recipient_client_id: recipientClientId,
                title,
                body,
                url
            }
        });
        if (error) {
            console.warn("No se pudo enviar la notificación push (función 'send-push' no desplegada):", error.message);
        }
        return { data, error };
    } catch (err) {
        console.error("Error de red al invocar Edge Function 'send-push':", err);
        return { data: null, error: err };
    }
}
