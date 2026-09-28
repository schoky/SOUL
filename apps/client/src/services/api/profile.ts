import { apiRequest } from "./client";

export type ProfileOverview = {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  averageSoul: number;
  bestSoul: number;
};

export type ProfileGameEntry = {
  gameId: string;
  finishedAt: string | null;
  soul: number | null;
  place: number | null;
  won: boolean;
  playersCount: number;
};

export async function getProfileStats(): Promise<ProfileOverview> {
  return apiRequest<ProfileOverview>("/api/profile/stats");
}

export async function getRecentGames(limit = 10): Promise<ProfileGameEntry[]> {
  const response = await apiRequest<{
    games: ProfileGameEntry[];
  }>(`/api/profile/games?limit=${limit}`);

  return response.games;
}
