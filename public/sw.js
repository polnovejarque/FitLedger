// Service Worker de FitLeader para Notificaciones Push en segundo plano

self.addEventListener('push', function(event) {
    if (!event.data) return;

    let payload = {};
    try {
        payload = event.data.json();
    } catch (e) {
        // En caso de que se envíe texto plano
        payload = {
            title: 'FitLeader',
            body: event.data.text()
        };
    }

    const title = payload.title || 'FitLeader';
    const options = {
        body: payload.body || 'Tienes una nueva notificación.',
        icon: payload.icon || '/logo.png',
        badge: payload.badge || '/logo.png',
        vibrate: [100, 50, 100],
        data: {
            url: payload.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Evento al hacer clic en la notificación: abre la aplicación en la URL correcta
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    const targetUrl = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Si la app ya está abierta en el navegador, la enfoca y navega
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    if (targetUrl) {
                        client.navigate(targetUrl);
                    }
                    return client.focus();
                }
            }
            // Si no estaba abierta, la abre en una nueva pestaña/pantalla
            if (clients.openWindow && targetUrl) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
