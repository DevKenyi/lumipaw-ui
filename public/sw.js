self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? 'LumiPaws';
  const options = {
    body: data.body ?? '',
    icon: '/paw.svg',
    badge: '/paw.svg',
    data: { url: data.url ?? '/orders' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const path = event.notification.data?.url ?? '/orders';
  const target = self.location.origin + path;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
