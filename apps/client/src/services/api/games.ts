import type { GameResultDto } from '@soul/shared';

import { apiRequest } from './client';

export async function getGameResult(roomId: string): Promise<GameResultDto> {
  const response = await apiRequest<{
    result: GameResultDto;
  }>(`/api/games/${roomId}/result`);

  return response.result;
}
