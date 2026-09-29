import { apiRequest } from "./client";
import type { GameHistoryItemDto } from "@soul/shared";

export async function getMyGames(
  limit = 10,
  offset = 0,
): Promise<GameHistoryItemDto[]> {
  const response = await apiRequest<{ games: GameHistoryItemDto[] }>(
    `/api/users/me/games?limit=${limit}&offset=${offset}`,
  );

  return response.games;
}
