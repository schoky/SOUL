import type { Player, PlayerCharacter } from '@soul/shared';
import { describe, expect, it } from 'vitest';

import { exhaustCharacters } from '../../src/players/exhaustCharacters';

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

describe('exhaustCharacters', () => {
  it('делает выбранного персонажа уставшим', () => {
    const result = exhaustCharacters(player, ['player-1-character-1']);

    expect(result.characters[0].exhausted).toBe(true);

    expect(result.characters[1].exhausted).toBe(false);
  });

  it('делает оба выбранных персонажа уставшими', () => {
    const result = exhaustCharacters(player, ['player-1-character-1', 'player-1-character-2']);

    expect(result.characters[0].exhausted).toBe(true);

    expect(result.characters[1].exhausted).toBe(true);
  });

  it('не изменяет исходного игрока', () => {
    exhaustCharacters(player, ['player-1-character-1']);

    expect(player.characters[0].exhausted).toBe(false);
  });

  it('выбрасывает ошибку, если карта не принадлежит игроку', () => {
    expect(() => {
      exhaustCharacters(player, ['unknown-character-card']);
    }).toThrow('Character card "unknown-character-card" not found');
  });

  it('не позволяет выбрать одну карту дважды', () => {
    expect(() => {
      exhaustCharacters(player, ['player-1-character-1', 'player-1-character-1']);
    }).toThrow('Character cards must be unique');
  });

  it('не позволяет вызвать функцию без выбранных карт', () => {
    expect(() => {
      exhaustCharacters(player, []);
    }).toThrow('At least one character card must be selected');
  });
});
