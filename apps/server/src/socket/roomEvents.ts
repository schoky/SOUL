import { SOCKET_EVENTS } from "@soul/shared";

import { getIO } from "./io.js";

const roomChannel = (roomId: string) => `room:${roomId}`;

/**
 * Отправляет всем подписчикам комнаты
 * актуальное состояние комнаты.
 */
export function emitRoomUpdated<T extends { id: string }>(room: T): void {
  const io = getIO();

  io.to(roomChannel(room.id)).emit(SOCKET_EVENTS.ROOM_UPDATED, { room });
}

/**
 * Сообщает всем подписчикам комнаты,
 * что комната была удалена.
 */
export function emitRoomDeleted(roomId: string): void {
  const io = getIO();

  io.to(roomChannel(roomId)).emit(SOCKET_EVENTS.ROOM_DELETED, { roomId });
}
