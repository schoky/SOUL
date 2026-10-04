import type { Player } from "@soul/shared";
import { GAME_RULES } from "@soul/shared";

export function createPlayer(id: string, name: string): Player {
  return {
    id,
    name,
    soul: GAME_RULES.STARTING_SOUL,
    characters: [],
    status: null,
    skipNextTurn: false,
    isReady: false,
    consecutiveSkips: 0,
  };
}
