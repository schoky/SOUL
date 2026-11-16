import type { GameState, Player } from '@soul/shared';
import { GAME_RULES } from '@soul/shared';

export type TurnResult = {
  game: GameState;
  player: Player;
  skipped: boolean;
};

export function startTurn(game: GameState): TurnResult {
  if (game.status !== 'playing') {
    throw new Error('Cannot start turn: game is not playing');
  }

  if (!game.currentPlayerId) {
    throw new Error('Cannot start turn: current player is not set');
  }

  const player = game.players.find((item) => item.id === game.currentPlayerId);

  if (!player) {
    throw new Error(`Player "${game.currentPlayerId}" not found`);
  }

  if (player.skipNextTurn) {
    const updatedPlayers = game.players.map((item) => {
      if (item.id !== player.id) {
        return item;
      }

      return {
        ...item,
        skipNextTurn: false,
        status: null
      };
    });

    const updatedGame: GameState = {
      ...game,
      players: updatedPlayers
    };

    const updatedPlayer = updatedPlayers.find((item) => item.id === player.id)!;

    return {
      game: updatedGame,
      player: updatedPlayer,
      skipped: true
    };
  }

  // Восстанавливаем GAME_RULES.RECOVERY_PER_TURN истощённых карт за ход.
  // Восстанавливаются первые слева направо — порядок стабилен.
  let recovered = 0;

  const updatedCharacters = player.characters.map((character) => {
    if (!character.exhausted || recovered >= GAME_RULES.RECOVERY_PER_TURN) {
      return character;
    }

    recovered += 1;

    return { ...character, exhausted: false };
  });

  const updatedPlayers = game.players.map((item) => {
    if (item.id !== player.id) {
      return item;
    }

    return { ...item, characters: updatedCharacters };
  });

  const updatedGame: GameState = {
    ...game,
    players: updatedPlayers
  };

  const updatedPlayer = updatedPlayers.find((item) => item.id === player.id)!;

  return {
    game: updatedGame,
    player: updatedPlayer,
    skipped: false
  };
}
