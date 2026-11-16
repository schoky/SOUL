import type { Player, PlayerCharacter } from '@soul/shared';
import { describe, expect, it } from 'vitest';

import { events } from '../../src/data/events';
import { createGame } from '../../src/game/createGame';
import { startTurn } from '../../src/turns/startTurn';

const killerCard: PlayerCharacter = {
  cardId: 'player-1-character-1',
  characterId: 'killer',
  exhausted: true,
  abilityUsed: false
};

const normalPlayer: Player = {
  id: 'player-1',
  name: 'Игрок 1',
  soul: 5,
  characters: [],
  status: null,
  isReady: false,
  skipNextTurn: false
};

const exhaustedPlayer: Player = {
  id: 'player-1',
  name: 'Игрок 1',
  soul: 5,
  characters: [killerCard],
  status: 'vygoranie',
  isReady: false,
  skipNextTurn: true
};

const tiredPlayer: Player = {
  id: 'player-1',
  name: 'Игрок 1',
  soul: 5,
  characters: [killerCard],
  status: null,
  isReady: false,
  skipNextTurn: false
};

function createPlayingGame(player: Player) {
  const game = createGame('game-1', [player], events);

  return {
    ...game,
    status: 'playing' as const,
    currentPlayerId: player.id,
    turnNumber: 1
  };
}

describe('startTurn', () => {
  it('обычный игрок получает ход', () => {
    const game = createPlayingGame(normalPlayer);

    const result = startTurn(game);

    expect(result.skipped).toBe(false);
    expect(result.player.id).toBe('player-1');
    expect(result.player.skipNextTurn).toBe(false);
  });

  it('игрок с Выгоранием пропускает ход', () => {
    const game = createPlayingGame(exhaustedPlayer);

    const result = startTurn(game);

    expect(result.skipped).toBe(true);
    expect(result.player.skipNextTurn).toBe(false);
    expect(result.player.status).toBeNull();
  });

  it('в начале обычного хода восстанавливает уставших персонажей', () => {
    const game = createPlayingGame(tiredPlayer);

    const result = startTurn(game);

    expect(result.skipped).toBe(false);
    expect(result.player.characters[0].exhausted).toBe(false);
  });

  it('не восстанавливает персонажей в пропущенном ходу', () => {
    const game = createPlayingGame(exhaustedPlayer);

    const result = startTurn(game);

    expect(result.skipped).toBe(true);
    expect(result.player.characters[0].exhausted).toBe(true);
  });
});
