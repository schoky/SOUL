import { endTurn, startTurn } from "@soul/game-engine";

import type { GameState } from "@soul/shared";

const MAX_TURN_ITERATIONS_FACTOR = 3;

/**
 * Передаёт ход следующему игроку,
 * пропуская тех, у кого стоит флаг skipNextTurn.
 */
export function advanceTurnLoop(game: GameState): GameState {
  let current = endTurn(game);

  const maxIterations = game.players.length * MAX_TURN_ITERATIONS_FACTOR;

  let iterations = 0;

  while (current.status === "playing" && iterations < maxIterations) {
    iterations += 1;

    const turn = startTurn(current);

    if (!turn.skipped) {
      return turn.game;
    }

    current = endTurn(turn.game);
  }

  return current;
}
