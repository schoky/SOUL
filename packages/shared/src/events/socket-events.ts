import type { Character } from '../types/character.js';
// NEW
import type { FriendDto, IncomingFriendRequestDto } from '../types/friend.js';
import type { GameState } from '../types/game.js';
import type { RoomInvitationDto } from '../types/invitation.js';
import type { RoomDto } from '../types/room.js';
import type { Status } from '../types/status.js';

export const SOCKET_EVENTS = {
  CONNECTED: 'connected',

  ROOM_SUBSCRIBE: 'room:subscribe',
  ROOM_UNSUBSCRIBE: 'room:unsubscribe',
  ROOM_UPDATED: 'room:updated',
  ROOM_DELETED: 'room:deleted',

  LOBBY_SUBSCRIBE: 'lobby:subscribe',
  LOBBY_UNSUBSCRIBE: 'lobby:unsubscribe',
  LOBBY_UPDATED: 'lobby:updated',

  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_READY: 'room:ready',

  GAME_START: 'game:start',
  GAME_STARTED: 'game:started',
  GAME_STATE: 'game:state',
  GAME_STATE_UPDATED: 'game:state-updated',
  GAME_PLAY_EVENT: 'game:play-event',
  GAME_END_TURN: 'game:end-turn',
  GAME_EVENT_RESOLVED: 'game:event-resolved',

  PLAYER_CONNECTION: 'game:player-connection',
  PLAYERS_CONNECTION: 'game:players-connection',

  // Админка (realtime)
  ADMIN_LOG_ADDED: 'admin:log-added',
  ADMIN_GAMES_UPDATED: 'admin:games-updated',
  ADMIN_ROOMS_UPDATED: 'admin:rooms-updated',

  // NEW — друзья
  FRIEND_REQUEST_RECEIVED: 'friend:request-received',
  FRIEND_REQUEST_ACCEPTED: 'friend:request-accepted',
  FRIEND_REQUEST_DECLINED: 'friend:request-declined',
  FRIEND_REMOVED: 'friend:removed',

  // NEW — приглашения в игру
  ROOM_INVITATION_RECEIVED: 'room:invitation-received',
  ROOM_INVITATION_ACCEPTED: 'room:invitation-accepted',
  ROOM_INVITATION_DECLINED: 'room:invitation-declined',

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

export type GameEventResolvedPayload = {
  playerId: string;
  playerName: string;
  success: boolean;
  risk: boolean;
  riskWon: boolean | null;
  gambleWon: boolean | null;
  soulBefore: number;
  soulAfter: number;
  status: Status | null;
  skipNextTurn: boolean;
};

export type PlayerConnectionPayload = {
  playerId: string;
  connected: boolean;
};

export type PlayersConnectionPayload = {
  connections: Record<string, boolean>;
};

export type SocketErrorPayload = {
  message: string;
};

// NEW — payload'ы realtime-событий друзей и приглашений

export type FriendRequestReceivedPayload = {
  request: IncomingFriendRequestDto;
};

export type FriendRequestAcceptedPayload = {
  friend: FriendDto;
};

export type FriendRequestDeclinedPayload = {
  requestId: string;
};

export type FriendRemovedPayload = {
  userId: string;
};

export type RoomInvitationReceivedPayload = {
  invitation: RoomInvitationDto;
};

export type RoomInvitationAcceptedPayload = {
  invitationId: string;
  roomId: string;
};

export type RoomInvitationDeclinedPayload = {
  invitationId: string;
};
