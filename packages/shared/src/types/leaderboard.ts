export type LeaderboardEntryDto = {
  userId: string;
  name: string;
  gamesPlayed: number;
  wins: number;
  totalSoul: number;
  bestSoul: number;
};

export type LeaderboardResponse = {
  entries: LeaderboardEntryDto[];
};
