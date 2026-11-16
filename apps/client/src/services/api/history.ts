import type { GameHistoryItemDto } from '@soul/shared';

import { apiRequest } from './client';

export async function getMyGames(limit = 10, offset = 0): Promise<GameHistoryItemDto[]> {
  const response = await apiRequest<{ games: GameHistoryItemDto[] }>(
    `/api/users/me/games?limit=${limit}&offset=${offset}`
  );

  return response.games;
}
