import { apiRequest } from "./client";

import type { UserProfile } from "./auth";

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

export type UpdateProfileInput = {
  nickname?: string;
  avatar?: string | null;
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

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UserProfile> {
  const response = await apiRequest<{
    profile: UserProfile;
  }>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return response.profile;
}
