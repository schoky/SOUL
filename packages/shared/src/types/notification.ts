export type UnreadCountDto = {
  friendRequests: number;
  invitations: number;
  total: number;
};

export type MarkNotificationsReadResponse = {
  success: boolean;
};
