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
      const existing = list.find(c => c.url.startsWith(self.location.origin));
      if (existing) return existing.navigate(target).then(c => c && c.focus());
      return clients.openWindow(target);
    })
  );
});
