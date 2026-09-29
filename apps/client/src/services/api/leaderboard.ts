import { apiRequest } from "./client";
import type { LeaderboardEntryDto } from "@soul/shared";

export async function getLeaderboard(
  limit = 50,
): Promise<LeaderboardEntryDto[]> {
  const response = await apiRequest<{ entries: LeaderboardEntryDto[] }>(
    `/api/leaderboard?limit=${limit}`,
  );

  return response.entries;
}
