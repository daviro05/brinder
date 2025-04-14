self.addEventListener('push', event => {
  console.log('Push recibido con datos:', event.data ? event.data.text() : 'sin datos');

  if (event.data) {
    let data;
    try {
      data = event.data.json();
    } catch (err) {
      console.error('Error parseando los datos del push:', err);
      return;
    }

    console.log('Datos de la notificación:', data);

    const options = {
      body: data.body,
      icon: data.icon || 'assets/icons/icon-128x128.png',
      badge: data.badge || 'assets/icons/badge-72x72.png',
      image: data.image,
      data: data.data || {},
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } else {
    console.log('Push event pero no hay data');
  }
});

self.addEventListener('notificationclick', event => {
  console.log('Notificación clickeada', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  console.log('Abrir URL:', urlToOpen);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
