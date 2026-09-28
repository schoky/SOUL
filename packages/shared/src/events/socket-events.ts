import type { Character } from "../types/character.js";
import type { GameState } from "../types/game.js";
import type { RoomDto } from "../types/room.js";

export const SOCKET_EVENTS = {
  CONNECTED: "connected",

  ROOM_SUBSCRIBE: "room:subscribe",
  ROOM_UNSUBSCRIBE: "room:unsubscribe",
  ROOM_UPDATED: "room:updated",
  ROOM_DELETED: "room:deleted",

  LOBBY_SUBSCRIBE: "lobby:subscribe",
  LOBBY_UNSUBSCRIBE: "lobby:unsubscribe",
  LOBBY_UPDATED: "lobby:updated",

  ROOM_CREATE: "room:create",
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  ROOM_READY: "room:ready",

  GAME_START: "game:start",
  GAME_STARTED: "game:started",
  GAME_STATE: "game:state",
  GAME_STATE_UPDATED: "game:state-updated",
  GAME_PLAY_EVENT: "game:play-event",
  GAME_END_TURN: "game:end-turn",

  ERROR: "error",
} as const;

export type RoomCreatePayload = {
  playerName: string;
};

export type RoomJoinPayload = {
  roomId: string;
  playerName: string;
};

export type RoomReadyPayload = {
  roomId: string;
  ready: boolean;
};

export type RoomSubscribePayload = {
  roomId: string;
};

export type RoomUpdatedPayload = {
  room: RoomDto;
};

export type RoomDeletedPayload = {
  roomId: string;
};

export type GameStartPayload = {
  roomId: string;
};

export type GameSessionPayload = {
  gameState: GameState;
  characters: Character[];
};

export type GameStartedPayload = GameSessionPayload;

export type GameStateUpdatedPayload = GameSessionPayload;

export type GamePlayEventPayload = {
  roomId: string;
  characterCardIds: string[];
  risk: boolean;
};

export type GameEndTurnPayload = {
  roomId: string;
};

export type SocketErrorPayload = {
  message: string;
};
