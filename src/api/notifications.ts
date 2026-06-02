import api from './axios';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: (): Promise<AppNotification[]> =>
    api.get('/api/notifications').then(r => r.data.data),

  getUnreadCount: (): Promise<number> =>
    api.get('/api/notifications/unread-count').then(r => r.data.data),

  markRead: (id: string): Promise<void> =>
    api.post(`/api/notifications/${id}/read`).then(r => r.data),

  markAllRead: (): Promise<void> =>
    api.post('/api/notifications/read-all').then(r => r.data),

  getVapidPublicKey: (): Promise<string> =>
    api.get('/api/push/vapid-public-key').then(r => r.data.data),

  subscribe: (sub: { endpoint: string; keys: Record<string, string> | null }): Promise<void> =>
    api.post('/api/push/subscribe', sub).then(r => r.data),
};
