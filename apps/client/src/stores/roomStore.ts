import { create } from "zustand";

import { ApiError } from "../services/api/client";

import {
  createRoom as createRoomRequest,
  getCurrentRoom as getCurrentRoomRequest,
  getRoom as getRoomRequest,
  getRooms,
  joinRoom as joinRoomRequest,
  leaveRoom as leaveRoomRequest,
  setReady as setReadyRequest,
} from "../services/api/rooms";

import type { CreateRoomRequest, RoomDto } from "@soul/shared";

type RoomStore = {
  rooms: RoomDto[];

  currentRoom: RoomDto | null;

  isLoading: boolean;

  isMutating: boolean;

  error: string | null;

  loadRooms: (userId?: string) => Promise<void>;

  loadRoom: (roomId: string) => Promise<void>;

  createRoom: (data?: CreateRoomRequest) => Promise<RoomDto | null>;

  joinRoom: (roomId: string) => Promise<RoomDto | null>;

  setReady: (roomId: string, isReady: boolean) => Promise<RoomDto | null>;

  leaveRoom: (roomId: string) => Promise<RoomDto | null>;

  applyRoomUpdate: (room: RoomDto) => void;

  clearCurrentRoom: () => void;

  clearError: () => void;

  reset: () => void;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Произошла неизвестная ошибка";
};

const upsertRoom = (rooms: RoomDto[], room: RoomDto) => {
  const existingRoomIndex = rooms.findIndex((item) => item.id === room.id);

  if (existingRoomIndex === -1) {
    return [...rooms, room];
  }

  return rooms.map((item) => (item.id === room.id ? room : item));
};

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],

  currentRoom: null,

  isLoading: false,

  isMutating: false,

  error: null,

  /**
   * Загружает список открытых комнат
   * и активную комнату пользователя.
   */
  async loadRooms(userId) {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const rooms = await getRooms();

      const currentRoom = userId ? await getCurrentRoomRequest() : null;

      set({
        rooms,
        currentRoom,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  /**
   * Загружает одну конкретную комнату.
   */
  async loadRoom(roomId) {
    set({
      isLoading: true,
      error: null,
      currentRoom: null,
    });

    try {
      const room = await getRoomRequest(roomId);

      set((state) => ({
        currentRoom: room,

        rooms: upsertRoom(state.rooms, room),
      }));
    } catch (error) {
      set({
        error: getErrorMessage(error),
        currentRoom: null,
      });
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  /**
   * Создаёт комнату.
   */
  async createRoom(data = {}) {
    set({
      isMutating: true,
      error: null,
    });

    try {
      const room = await createRoomRequest(data);

      set((state) => ({
        currentRoom: room,

        rooms: upsertRoom(state.rooms, room),
      }));

      return room;
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });

      return null;
    } finally {
      set({
        isMutating: false,
      });
    }
  },

  /**
   * Присоединяет пользователя
   * к комнате.
   */
  async joinRoom(roomId) {
    set({
      isMutating: true,
      error: null,
    });

    try {
      const room = await joinRoomRequest(roomId);

      set((state) => ({
        currentRoom: room,

        rooms: upsertRoom(state.rooms, room),
      }));

      return room;
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });

      return null;
    } finally {
      set({
        isMutating: false,
      });
    }
  },

  /**
   * Меняет готовность текущего
   * пользователя.
   */
  async setReady(roomId, isReady) {
    set({
      isMutating: true,
      error: null,
    });

    try {
      const room = await setReadyRequest(roomId, isReady);

      set((state) => ({
        currentRoom: room,

        rooms: upsertRoom(state.rooms, room),
      }));

      return room;
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });

      return null;
    } finally {
      set({
        isMutating: false,
      });
    }
  },

  /**
   * Выводит пользователя
   * из комнаты.
   */
  async leaveRoom(roomId) {
    set({
      isMutating: true,
      error: null,
    });

    try {
      const room = await leaveRoomRequest(roomId);

      set((state) => ({
        currentRoom: null,

        rooms: room
          ? upsertRoom(state.rooms, room)
          : state.rooms.filter((item) => item.id !== roomId),
      }));

      return room;
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });

      return null;
    } finally {
      set({
        isMutating: false,
      });
    }
  },

  /**
   * Применяет обновление комнаты,
   * полученное по сокету.
   */
  applyRoomUpdate(room) {
    set((state) => ({
      currentRoom: state.currentRoom?.id === room.id ? room : state.currentRoom,

      rooms: upsertRoom(state.rooms, room),
    }));
  },

  /**
   * Очищает текущую комнату
   * (например, если она была удалена).
   */
  clearCurrentRoom() {
    set({
      currentRoom: null,
    });
  },

  clearError() {
    set({
      error: null,
    });
  },

  reset() {
    set({
      rooms: [],
      currentRoom: null,
      isLoading: false,
      isMutating: false,
      error: null,
    });
  },
}));
