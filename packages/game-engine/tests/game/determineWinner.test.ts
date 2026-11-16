import type { Player } from '@soul/shared';
import { describe, expect, it } from 'vitest';

import { determineWinner } from '../../src/game/determineWinner';

function createPlayer(id: string, soul: number): Player {
  return {
    id,
    name: id,
    soul,
    characters: [],
    status: null,
    isReady: false,
    skipNextTurn: false
  };
}

describe('determineWinner', () => {
  it('выбирает игрока с наибольшим количеством Soul', () => {
    const players = [
      createPlayer('player-1', 17),
      createPlayer('player-2', 20),
      createPlayer('player-3', 15)
    ];

    expect(determineWinner(players, 'player-1')).toBe('player-2');
  });

  it('при равенстве выбирает игрока, который запустил финальный раунд', () => {
    const players = [createPlayer('player-1', 18), createPlayer('player-2', 18)];

    expect(determineWinner(players, 'player-1')).toBe('player-1');
  });

  it('выбрасывает ошибку, если нет игроков', () => {
    expect(() => {
      determineWinner([], null);
    }).toThrow('Cannot determine winner: no players');
  });
});
