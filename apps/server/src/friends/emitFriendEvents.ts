import type { FriendDto, IncomingFriendRequestDto } from '@soul/shared';
import { SOCKET_EVENTS } from '@soul/shared';

import { getIO } from '../socket/io.js';

export function emitFriendRequestReceived(userId: string, request: IncomingFriendRequestDto): void {
  const io = getIO();

  io.to(`user:${userId}`).emit(SOCKET_EVENTS.FRIEND_REQUEST_RECEIVED, {
    request
  });
}

export function emitFriendRequestAccepted(userId: string, friend: FriendDto): void {
  const io = getIO();

  io.to(`user:${userId}`).emit(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, {
    friend
  });
}

export function emitFriendRequestDeclined(userId: string, requestId: string): void {
  const io = getIO();

  io.to(`user:${userId}`).emit(SOCKET_EVENTS.FRIEND_REQUEST_DECLINED, {
    requestId
  });
}

export function emitFriendRemoved(userId: string, otherUserId: string): void {
  const io = getIO();

  io.to(`user:${userId}`).emit(SOCKET_EVENTS.FRIEND_REMOVED, {
    userId: otherUserId
  });
}
