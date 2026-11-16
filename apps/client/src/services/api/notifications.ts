import type { MarkNotificationsReadResponse, UnreadCountDto } from '@soul/shared';

import { apiRequest } from './client';

export async function getUnreadCount(): Promise<UnreadCountDto> {
  return apiRequest<UnreadCountDto>('/api/notifications/unread');
}

export async function markNotificationsAsRead(): Promise<void> {
  await apiRequest<MarkNotificationsReadResponse>('/api/notifications/read', {
    method: 'POST'
  });
}
