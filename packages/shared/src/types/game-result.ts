export type GameResultPlayerDto = {
  userId: string;
  name: string;
  place: number;
  finalSoul: number;
};

export type GameResultDto = {
  gameId: string;
  roomId: string;
  startedAt: string;
  finishedAt: string | null;
  turns: number;
  winnerId: string | null;
  players: GameResultPlayerDto[];
};
