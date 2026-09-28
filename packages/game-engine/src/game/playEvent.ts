import { GAME_RULES, type GameState } from "@soul/shared";

import { resolveEvent } from "../events/resolveEvent.js";
import { exhaustCharacters } from "../players/exhaustCharacters.js";
import { startFinalRound } from "./startFinalRound.js";

export type PlayEventResult = {
  game: GameState;
  success: boolean;
  gambleWon: boolean | null;
  riskWon: boolean | null;
};

export function playEvent(
  game: GameState,
  characterCardIds: string[],
  risk = false,
  random: () => number = Math.random,
): PlayEventResult {
  if (game.status !== "playing") {
    throw new Error("Cannot play event: game is not playing");
  }

  if (!game.currentPlayerId) {
    throw new Error("Cannot play event: current player is not set");
  }

  if (!game.currentEvent) {
    throw new Error("Cannot play event: current event is not set");
  }

  const playerIndex = game.players.findIndex(
    (player) => player.id === game.currentPlayerId,
  );

  if (playerIndex === -1) {
    throw new Error(`Current player "${game.currentPlayerId}" not found`);
  }

  const player = game.players[playerIndex];

  const result = resolveEvent(
    player,
    characterCardIds,
    game.currentEvent,
    game.characters,
    risk,
    random,
  );

  const abilityUpdatedPlayer = {
    ...player,
    soul: result.soul,
    status: result.status,
    skipNextTurn: result.skipNextTurn,
    characters: player.characters.map((character) => {
      if (!result.abilityUsedCardIds.includes(character.cardId)) {
        return character;
      }

      return {
        ...character,
        abilityUsed: true,
      };
    }),
  };

  const updatedPlayer = exhaustCharacters(
    abilityUpdatedPlayer,
    characterCardIds,
  );

  const updatedPlayers = [...game.players];

  updatedPlayers[playerIndex] = updatedPlayer;

  let updatedGame: GameState = {
    ...game,
    players: updatedPlayers,
  };

  if (
    !updatedGame.finalRoundStartedBy &&
    updatedPlayer.soul >= GAME_RULES.WINNING_SOUL
  ) {
    updatedGame = startFinalRound(updatedGame, updatedPlayer.id);
  }

  return {
    game: updatedGame,
    success: result.success,
    gambleWon: result.gambleWon,
    riskWon: result.riskWon,
  };
}
