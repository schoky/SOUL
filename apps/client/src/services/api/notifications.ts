import { apiRequest } from "./client";

import type {
  MarkNotificationsReadResponse,
  UnreadCountDto,
} from "@soul/shared";

export async function getUnreadCount(): Promise<UnreadCountDto> {
  return apiRequest<UnreadCountDto>("/api/notifications/unread");
}

export async function markNotificationsAsRead(): Promise<void> {
  await apiRequest<MarkNotificationsReadResponse>("/api/notifications/read", {
    method: "POST",
  });
}
