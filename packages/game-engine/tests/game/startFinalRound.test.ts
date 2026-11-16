import type { Player } from '@soul/shared';
import { describe, expect, it } from 'vitest';

import { events } from '../../src/data/events';
import { createGame } from '../../src/game/createGame';
import { startFinalRound } from '../../src/game/startFinalRound';

const player: Player = {
  id: 'player-1',
  name: 'Игрок 1',
  soul: 15,
  characters: [],
  status: null,
  isReady: false,
  skipNextTurn: false
};

describe('startFinalRound', () => {
  it('запускает финальный раунд, когда игрок достигает 15 Soul', () => {
    const game = {
      ...createGame('game-1', [player], events),
      status: 'playing' as const,
      currentPlayerId: player.id
    };

    const result = startFinalRound(game, player.id);

    expect(result.finalRoundStartedBy).toBe(player.id);
  });

  it('не запускает финальный раунд, если игрок не набрал 15 Soul', () => {
    const playerWithLowSoul: Player = {
      ...player,
      soul: 14
    };

    const game = {
      ...createGame('game-1', [playerWithLowSoul], events),
      status: 'playing' as const,
      currentPlayerId: playerWithLowSoul.id
    };

    expect(() => {
      startFinalRound(game, playerWithLowSoul.id);
    }).toThrow(`Player "${playerWithLowSoul.id}" has not reached 15 Soul`);
  });

  it('не перезапускает уже начатый финальный раунд', () => {
    const player2: Player = {
      ...player,
      id: 'player-2',
      name: 'Игрок 2'
    };

    const game = {
      ...createGame('game-1', [player, player2], events),
      status: 'playing' as const,
      finalRoundStartedBy: player.id
    };

    const result = startFinalRound(game, player2.id);

    expect(result.finalRoundStartedBy).toBe(player.id);
  });
});
