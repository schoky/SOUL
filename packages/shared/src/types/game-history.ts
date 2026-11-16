import type { GameResultPlayerDto } from './game-result.js';

export type GameHistoryItemDto = {
  gameId: string;
  roomId: string;
  startedAt: string;
  finishedAt: string | null;
  turns: number;
  place: number;
  finalSoul: number;
  players: GameResultPlayerDto[];
};

export type GameHistoryResponse = {
  games: GameHistoryItemDto[];
};
