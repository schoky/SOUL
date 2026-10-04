export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";

export type RoomInvitationDto = {
  id: string;
  roomId: string;
  roomCode: string;
  createdAt: string;
  expiresAt: string;
  isRead: boolean;
  inviter: {
    userId: string;
    nickname: string;
    avatar: string | null;
  };
  membersCount: number;
  maxPlayers: number;
};

export type RoomInvitationsResponse = {
  invitations: RoomInvitationDto[];
};

export type SendRoomInvitationInput = {
  inviteeId: string;
};

export type SendRoomInvitationResponse = {
  invitation: RoomInvitationDto;
};

export type AcceptRoomInvitationResponse = {
  roomId: string;
};
