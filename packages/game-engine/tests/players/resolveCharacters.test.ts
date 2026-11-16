import type { Player, PlayerCharacter } from '@soul/shared';
import { describe, expect, it } from 'vitest';

import { characters } from '../../src/data/characters';
import { resolveCharacters } from '../../src/players/resolveCharacters';

const killerCard: PlayerCharacter = {
  cardId: 'player-1-character-1',
  characterId: 'killer',
  exhausted: false,
  abilityUsed: false
};

const workaholicCard: PlayerCharacter = {
  cardId: 'player-1-character-2',
  characterId: 'workaholic',
  exhausted: false,
  abilityUsed: false
};

const player: Player = {
  id: 'player-1',
  name: 'Игрок 1',
  soul: 3,
  characters: [killerCard, workaholicCard],
  status: null,
  isReady: false,
  skipNextTurn: false
};

describe('resolveCharacters', () => {
  it('разрешает выбор одного персонажа', () => {
    const result = resolveCharacters(player, ['player-1-character-1'], characters);

    expect(result.cards).toHaveLength(1);
    expect(result.characters).toHaveLength(1);
    expect(result.stats).toEqual({
      farmila: 4,
      perekup: 2,
      tuller: 5
    });
  });

  it('объединяет характеристики двух персонажей в связке', () => {
    const result = resolveCharacters(
      player,
      ['player-1-character-1', 'player-1-character-2'],
      characters
    );

    expect(result.cards).toHaveLength(2);
    expect(result.characters).toHaveLength(2);
    expect(result.stats).toEqual({
      farmila: 9,
      perekup: 5,
      tuller: 7
    });
  });

  it('выбрасывает ошибку, если карта не принадлежит игроку', () => {
    expect(() => {
      resolveCharacters(player, ['unknown-character-card'], characters);
    }).toThrow('Character card "unknown-character-card" not found');
  });

  it('не позволяет использовать уставшую карту', () => {
    const exhaustedPlayer: Player = {
      ...player,
      characters: [{ ...killerCard, exhausted: true }, workaholicCard]
    };

    expect(() => {
      resolveCharacters(exhaustedPlayer, ['player-1-character-1'], characters);
    }).toThrow('Character card "player-1-character-1" is exhausted');
  });

  it('не позволяет выбрать одну карту дважды', () => {
    expect(() => {
      resolveCharacters(player, ['player-1-character-1', 'player-1-character-1'], characters);
    }).toThrow('Character cards must be unique');
  });

  it('не позволяет выбрать больше двух персонажей', () => {
    expect(() => {
      resolveCharacters(
        player,
        ['player-1-character-1', 'player-1-character-2', 'unknown-character-card'],
        characters
      );
    }).toThrow('Cannot select more than two character cards');
  });

  it('не позволяет начать событие без выбранного персонажа', () => {
    expect(() => {
      resolveCharacters(player, [], characters);
    }).toThrow('At least one character card must be selected');
  });
});
