import { apiRequest } from "./client";

import type { GameResultDto } from "@soul/shared";

export async function getGameResult(roomId: string): Promise<GameResultDto> {
  const response = await apiRequest<{
    result: GameResultDto;
  }>(`/api/games/${roomId}/result`);

  return response.result;
}
