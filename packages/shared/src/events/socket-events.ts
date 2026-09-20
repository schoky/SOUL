import type {GameState} from '../types/game.js';

export const SOCKET_EVENTS = {
	CONNECTED: 'connected',
	
	ROOM_CREATE: 'room:create',
	ROOM_JOIN: 'room:join',
	ROOM_LEAVE: 'room:leave',
	ROOM_READY: 'room:ready',
	
	GAME_START: 'game:start',
	GAME_STATE: 'game:state',
	GAME_PLAY_EVENT: 'game:play-event',
	GAME_SELECT_CHARACTER: 'game:select-character',
	GAME_ROLL: 'game:roll',
	GAME_END_TURN: 'game:end-turn',
	
	ERROR: 'error'
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

export type GamePlayEventPayload = {
	roomId: string;
	characterId: string;
};

export type GameSelectCharacterPayload = {
	roomId: string;
	characterId: string;
};

export type GameRollPayload = {
	roomId: string;
};

export type GameEndTurnPayload = {
	roomId: string;
};

export type GameStatePayload = {
	state: GameState;
};

export type SocketErrorPayload = {
	message: string;
};