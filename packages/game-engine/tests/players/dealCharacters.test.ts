import type { Character, Player } from '@soul/shared';
import { describe, expect, it } from 'vitest';

import { dealCharacters } from '../../src/players/dealCharacters';

const characters: Character[] = [
  {
    id: 'character-1',
    name: 'Персонаж 1',
    stats: {
      farmila: 1,
      perekup: 2,
      tuller: 3
    }
  },
  {
    id: 'character-2',
    name: 'Персонаж 2',
    stats: {
      farmila: 4,
      perekup: 5,
      tuller: 6
    }
  },
  {
    id: 'character-3',
    name: 'Персонаж 3',
    stats: {
      farmila: 7,
      perekup: 8,
      tuller: 9
    }
  },
  {
    id: 'character-4',
    name: 'Персонаж 4',
    stats: {
      farmila: 2,
      perekup: 3,
      tuller: 4
    }
  }
];

const players: Player[] = [
  {
    id: 'player-1',
    name: 'Игрок 1',
    soul: 3,
    characters: [],
    status: null,
    skipNextTurn: false,
    isReady: true
  },
  {
    id: 'player-2',
    name: 'Игрок 2',
    soul: 3,
    characters: [],
    status: null,
    skipNextTurn: false,
    isReady: true
  }
];

describe('dealCharacters', () => {
  it('выдаёт каждому игроку по 2 карты персонажей', () => {
    const result = dealCharacters(players, characters, () => 0);

    expect(result[0].characters).toHaveLength(2);

    expect(result[1].characters).toHaveLength(2);
  });

  it('создаёт уникальные карты для каждого игрока', () => {
    const result = dealCharacters(players, characters, () => 0);

    const cardIds = result.flatMap((player) =>
      player.characters.map((character) => character.cardId)
    );

    expect(cardIds).toHaveLength(4);

    expect(new Set(cardIds).size).toBe(cardIds.length);
  });

  it('может выдать один и тот же тип персонажа разным игрокам', () => {
    const result = dealCharacters(players, characters, () => 0);

    const firstPlayerCharacterIds = result[0].characters.map((character) => character.characterId);

    const secondPlayerCharacterIds = result[1].characters.map((character) => character.characterId);

    const sharedCharacterIds = firstPlayerCharacterIds.filter((characterId) =>
      secondPlayerCharacterIds.includes(characterId)
    );

    expect(sharedCharacterIds.length).toBeGreaterThan(0);
  });

  it('не изменяет исходный массив персонажей', () => {
    const originalCharacters = [...characters];

    dealCharacters(players, characters, () => 0);

    expect(characters).toEqual(originalCharacters);
  });

  it('выбрасывает ошибку, если недостаточно типов персонажей', () => {
    expect(() => {
      dealCharacters(players, characters.slice(0, 1));
    }).toThrow('Not enough character types');
  });
});
