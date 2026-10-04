import type { GameState } from "@soul/shared";
import { GAME_RULES } from "@soul/shared";

import { changeSoul } from "../rules/changeSoul.js";

/**
 * Добровольный пропуск хода.
 *
 * Списывает SKIP_PENALTY Soul и увеличивает счётчик
 * consecutiveSkips. Если лимит подряд исчерпан —
 * бросает ошибку.
 *
 * Карты при этом НЕ истощаются — игрок может
 * сохранить их на будущий ход.
 */
export function skipTurn(game: GameState): GameState {
  if (game.status !== "playing") {
    throw new Error("Cannot skip turn: game is not playing");
  }

  if (!game.currentPlayerId) {
    throw new Error("Cannot skip turn: current player is not set");
  }

  const playerIndex = game.players.findIndex(
    (player) => player.id === game.currentPlayerId,
  );

  if (playerIndex === -1) {
    throw new Error(`Current player "${game.currentPlayerId}" not found`);
  }

  const player = game.players[playerIndex];

  if (player.consecutiveSkips >= GAME_RULES.MAX_CONSECUTIVE_SKIPS) {
    throw new Error(
      `Cannot skip: limit of ${GAME_RULES.MAX_CONSECUTIVE_SKIPS} consecutive skips reached`,
    );
  }

  const updatedPlayer = {
    ...player,
    soul: changeSoul(player.soul, -GAME_RULES.SKIP_PENALTY),
    consecutiveSkips: player.consecutiveSkips + 1,
  };

  const updatedPlayers = [...game.players];

  updatedPlayers[playerIndex] = updatedPlayer;

  return {
    ...game,
    players: updatedPlayers,
  };
}
