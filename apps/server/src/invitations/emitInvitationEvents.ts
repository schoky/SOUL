import { SOCKET_EVENTS } from '@soul/shared';
import type { RoomInvitationDto } from '@soul/shared';

import { getIO } from '../socket/io.js';

export function emitRoomInvitationReceived(inviteeId: string, invitation: RoomInvitationDto): void {
  const io = getIO();

  io.to(`user:${inviteeId}`).emit(SOCKET_EVENTS.ROOM_INVITATION_RECEIVED, {
    invitation
  });
}

export function emitRoomInvitationAccepted(
  inviterId: string,
  invitationId: string,
  roomId: string
): void {
  const io = getIO();

  io.to(`user:${inviterId}`).emit(SOCKET_EVENTS.ROOM_INVITATION_ACCEPTED, {
    invitationId,
    roomId
  });
}

export function emitRoomInvitationDeclined(inviterId: string, invitationId: string): void {
  const io = getIO();

  io.to(`user:${inviterId}`).emit(SOCKET_EVENTS.ROOM_INVITATION_DECLINED, {
    invitationId
  });
}
