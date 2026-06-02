import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { notificationsApi } from '../api/notifications';

export function usePushNotifications() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    registerAndSubscribe();
  }, [isAuthenticated]);
}

async function registerAndSubscribe() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    const existing = await registration.pushManager.getSubscription();
    if (existing) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const vapidPublicKey = await notificationsApi.getVapidPublicKey();
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const json = subscription.toJSON();
    await notificationsApi.subscribe({
      endpoint: json.endpoint!,
      keys: json.keys ?? null,
    });
  } catch (err) {
    console.error('[Push] subscription failed', err);
  }
}

function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return buffer;
}
