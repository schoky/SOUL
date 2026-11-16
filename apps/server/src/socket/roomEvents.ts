import { SOCKET_EVENTS } from '@soul/shared';

import { getIO } from './io.js';

const roomChannel = (roomId: string) => `room:${roomId}`;

const LOBBY_CHANNEL = 'lobby';

const ADMIN_CHANNEL = 'admin';

export function emitRoomUpdated<T extends { id: string }>(room: T): void {
  const io = getIO();

  io.to(roomChannel(room.id)).emit(SOCKET_EVENTS.ROOM_UPDATED, { room });

  io.to(ADMIN_CHANNEL).emit(SOCKET_EVENTS.ADMIN_ROOMS_UPDATED);
}

export function emitRoomDeleted(roomId: string): void {
  const io = getIO();

  io.to(roomChannel(roomId)).emit(SOCKET_EVENTS.ROOM_DELETED, { roomId });

  io.to(ADMIN_CHANNEL).emit(SOCKET_EVENTS.ADMIN_ROOMS_UPDATED);
}

/**
 * Сообщает всем, кто подписан на лобби,
 * что список комнат изменился.
 *
 * Никакого payload — клиент сам делает refetch,
 * чтобы не передавать большие списки.
 */
export function emitLobbyUpdated(): void {
  const io = getIO();

  io.to(LOBBY_CHANNEL).emit(SOCKET_EVENTS.LOBBY_UPDATED);
}
