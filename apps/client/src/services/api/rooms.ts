import { apiRequest } from "./client";

import type {
  CreateRoomRequest,
  RoomDto,
  RoomListResponse,
  RoomPreviewDto,
  RoomResponse
} from "@soul/shared";

/**
 * Получает список комнат,
 * доступных для входа.
 */
export async function getRooms() {
  const response = await apiRequest<RoomListResponse>("/api/rooms");

  return response.rooms;
}

/**
 * Получает активную комнату текущего пользователя.
 */
export async function getCurrentRoom() {
  const response = await apiRequest<RoomResponse>("/api/rooms/current");

  return response.room;
}

/**
 * Получает публичное превью комнаты
 * для ссылки-приглашения.
 */
export async function getRoomPreview(roomId: string): Promise<RoomPreviewDto> {
  const response = await apiRequest<{
    room: RoomPreviewDto;
  }>(`/api/rooms/${roomId}/preview`);

  return response.room;
}

/**
 * Получает конкретную комнату.
 */
export async function getRoom(roomId: string) {
  const response = await apiRequest<{
    room: RoomDto;
  }>(`/api/rooms/${roomId}`);

  return response.room;
}

/**
 * Создаёт новую комнату.
 */
export async function createRoom(data: CreateRoomRequest = {}) {
  const response = await apiRequest<{
    room: RoomDto;
  }>("/api/rooms", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return response.room;
}

/**
 * Присоединяет текущего авторизованного
 * пользователя к комнате.
 */
export async function joinRoom(roomId: string) {
  const response = await apiRequest<{
    room: RoomDto;
  }>(`/api/rooms/${roomId}/join`, {
    method: "POST",
  });

  return response.room;
}

/**
 * Меняет готовность текущего пользователя
 * в комнате.
 */
export async function setReady(roomId: string, isReady: boolean) {
  const response = await apiRequest<{
    room: RoomDto;
  }>(`/api/rooms/${roomId}/ready`, {
    method: "PATCH",
    body: JSON.stringify({ isReady }),
  });

  return response.room;
}

/**
 * Выводит текущего пользователя из комнаты.
 */
export async function leaveRoom(roomId: string) {
  const response = await apiRequest<RoomResponse>(
    `/api/rooms/${roomId}/leave`,
    {
      method: "POST",
    },
  );

  return response.room;
}
