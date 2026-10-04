import type { UnreadCountDto } from "@soul/shared";

import { friendService } from "../friends/friendService.js";
import { invitationService } from "../invitations/invitationService.js";

class NotificationService {
  async getUnreadCount(userId: string): Promise<UnreadCountDto> {
    const [friendRequests, invitations] = await Promise.all([
      friendService.countUnread(userId),
      invitationService.countUnread(userId),
    ]);

    return {
      friendRequests,
      invitations,
      total: friendRequests + invitations,
    };
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Promise.all([
      friendService.markAllAsRead(userId),
      invitationService.markAllAsRead(userId),
    ]);
  }
}

export const notificationService = new NotificationService();
