export type { Character, CharacterAbility } from "./types/character.js";

export type { EventCard } from "./types/event.js";

export type { EventDeck } from "./types/event-deck.js";

export type { GameState, GameStatus } from "./types/game.js";

export type { Player } from "./types/player.js";

export type { PlayerCharacter } from "./types/player-character.js";

export type { Status } from "./types/status.js";

export type { CharacterStats, StatType } from "./types/stats.js";

export type {
  GameResultDto,
  GameResultPlayerDto,
} from "./types/game-result.js";

// НОВЫЙ — друзья
export type {
  FriendshipStatus,
  FriendDto,
  IncomingFriendRequestDto,
  OutgoingFriendRequestDto,
  FriendsListResponse,
  FriendRequestsResponse,
  SendFriendRequestInput,
  SendFriendRequestResponse,
  AcceptFriendRequestResponse,
} from "./types/friend.js";

// НОВЫЙ — приглашения в игру
export type {
  InvitationStatus,
  RoomInvitationDto,
  RoomInvitationsResponse,
  SendRoomInvitationInput,
  SendRoomInvitationResponse,
  AcceptRoomInvitationResponse,
} from "./types/invitation.js";

// НОВЫЙ — уведомления
export type {
  UnreadCountDto,
  MarkNotificationsReadResponse,
} from "./types/notification.js";

export { SOCKET_EVENTS } from "./events/socket-events.js";

export { GAME_RULES, ROOM_RULES, RISK_CHANCES } from "./constants/game.js";

export type {
  RoomCreatePayload,
  RoomJoinPayload,
  RoomReadyPayload,
  RoomSubscribePayload,
  RoomUpdatedPayload,
  RoomDeletedPayload,
  GameStartPayload,
  GameSessionPayload,
  GameStartedPayload,
  GameStateUpdatedPayload,
  GamePlayEventPayload,
  GameEndTurnPayload,
  GameEventResolvedPayload,
  PlayerConnectionPayload,
  PlayersConnectionPayload,
  SocketErrorPayload,
  // НОВЫЙ — realtime-события друзей и приглашений
  FriendRequestReceivedPayload,
  FriendRequestAcceptedPayload,
  FriendRequestDeclinedPayload,
  FriendRemovedPayload,
  RoomInvitationReceivedPayload,
  RoomInvitationAcceptedPayload,
  RoomInvitationDeclinedPayload,
} from "./events/socket-events.js";

export type {
  RoomStatus,
  RoomProfileDto,
  RoomUserDto,
  RoomMemberDto,
  RoomDto,
  RoomPreviewDto,
  RoomListResponse,
  RoomResponse,
  RoomPreviewResponse,
  RoomErrorResponse,
  CreateRoomRequest,
} from "./types/room.js";

export type {
  GameHistoryItemDto,
  GameHistoryResponse,
} from "./types/game-history.js";

export type {
  LeaderboardEntryDto,
  LeaderboardResponse,
} from "./types/leaderboard.js";
