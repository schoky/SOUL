import type { Character, EventCard, Player, PlayerCharacter } from '@soul/shared';
import { describe, expect, it } from 'vitest';

import { resolveCharacterAbilities } from '../../src/players/resolveCharacterAbilities';

const killerCard: PlayerCharacter = {
  cardId: 'player-1-character-1',
  characterId: 'killer',
  exhausted: false,
  abilityUsed: false
};

const marketSharkCard: PlayerCharacter = {
  cardId: 'player-1-character-2',
  characterId: 'market-shark',
  exhausted: false,
  abilityUsed: false
};

const workaholicCard: PlayerCharacter = {
  cardId: 'player-1-character-3',
  characterId: 'workaholic',
  exhausted: false,
  abilityUsed: false
};

const characterList: Character[] = [
  {
    id: 'killer',
    name: 'Киллер',
    stats: { farmila: 4, perekup: 2, tuller: 5 },
    ability: {
      id: 'cold-blooded',
      name: 'Хладнокровие',
      description: 'Первый провал по Туллеру за игру не отнимает Soul.'
    }
  },
  {
    id: 'market-shark',
    name: 'Рыночный перекуп',
    stats: { farmila: 2, perekup: 5, tuller: 3 },
    ability: {
      id: 'profitable-deal',
      name: 'Выгодная сделка',
      description: 'При успешном событии с Перекупом получает на 1 Soul больше.'
    }
  },
  {
    id: 'workaholic',
    name: 'Трудяга',
    stats: { farmila: 5, perekup: 3, tuller: 2 },
    ability: {
      id: 'work-to-exhaustion',
      name: 'На износ',
      description: 'При успешном событии с Фармилой получает дополнительный Soul.'
    }
  }
];

const player: Player = {
  id: 'player-1',
  name: 'Игрок 1',
  soul: 5,
  characters: [killerCard, marketSharkCard, workaholicCard],
  status: null,
  isReady: false,
  skipNextTurn: false
};

describe('resolveCharacterAbilities', () => {
  it('Хладнокровие отменяет потерю Soul при первом провале по Туллеру', () => {
    const event: EventCard = {
      id: 'tuller-failure',
      name: 'Провал по Туллеру',
      requirements: { farmila: 10, perekup: 10, tuller: 10 },
      mainStat: 'tuller',
      reward: 0,
      riskReward: 0,
      description: 'Тест.'
    };

    const result = resolveCharacterAbilities({
      player,
      cards: [killerCard],
      characters: [characterList[0]],
      event,
      success: false,
      currentSoul: 4,
      risk: false,
      riskWon: null,
      baseSuccess: false,
      cardCount: 1
    });

    expect(result.soul).toBe(5);
    expect(result.abilityUsedCardIds).toEqual(['player-1-character-1']);
    expect(result.cancelFailure).toBe(false);
  });

  it('Хладнокровие не срабатывает второй раз', () => {
    const usedKillerCard = {
      ...killerCard,
      abilityUsed: true
    };

    const event: EventCard = {
      id: 'tuller-failure',
      name: 'Провал по Туллеру',
      requirements: { farmila: 10, perekup: 10, tuller: 10 },
      mainStat: 'tuller',
      reward: 0,
      riskReward: 0,
      description: 'Тест.'
    };

    const result = resolveCharacterAbilities({
      player,
      cards: [usedKillerCard],
      characters: [characterList[0]],
      event,
      success: false,
      currentSoul: 4,
      risk: false,
      riskWon: null,
      baseSuccess: false,
      cardCount: 1
    });

    expect(result.soul).toBe(4);
    expect(result.abilityUsedCardIds).toEqual([]);
    expect(result.cancelFailure).toBe(false);
  });

  it('Выгодная сделка даёт +1 Soul при успешном событии по Перекупу', () => {
    const event: EventCard = {
      id: 'perekup-success',
      name: 'Сделка',
      requirements: { farmila: 0, perekup: 0, tuller: 0 },
      mainStat: 'perekup',
      reward: 2,
      riskReward: 4,
      description: 'Тест.'
    };

    const result = resolveCharacterAbilities({
      player,
      cards: [marketSharkCard],
      characters: [characterList[1]],
      event,
      success: true,
      currentSoul: 7,
      risk: false,
      riskWon: null,
      baseSuccess: true,
      cardCount: 1
    });

    expect(result.soul).toBe(8);
    expect(result.cancelFailure).toBe(false);
  });

  it('На износ даёт +1 Soul при успешном событии по Фармиле', () => {
    const event: EventCard = {
      id: 'farmila-success',
      name: 'Работа',
      requirements: { farmila: 0, perekup: 0, tuller: 0 },
      mainStat: 'farmila',
      reward: 2,
      riskReward: 4,
      description: 'Тест.'
    };

    const result = resolveCharacterAbilities({
      player,
      cards: [workaholicCard],
      characters: [characterList[2]],
      event,
      success: true,
      currentSoul: 7,
      risk: false,
      riskWon: null,
      baseSuccess: true,
      cardCount: 1
    });

    expect(result.soul).toBe(8);
    expect(result.cancelFailure).toBe(false);
  });

  it('не применяет способность, если её условие не выполнено', () => {
    const event: EventCard = {
      id: 'wrong-stat',
      name: 'Другое событие',
      requirements: { farmila: 0, perekup: 0, tuller: 0 },
      mainStat: 'farmila',
      reward: 2,
      riskReward: 4,
      description: 'Тест.'
    };

    const result = resolveCharacterAbilities({
      player,
      cards: [marketSharkCard],
      characters: [characterList[1]],
      event,
      success: false,
      currentSoul: 4,
      risk: false,
      riskWon: null,
      baseSuccess: false,
      cardCount: 1
    });

    expect(result.soul).toBe(4);
    expect(result.abilityUsedCardIds).toEqual([]);
    expect(result.cancelFailure).toBe(false);
  });
});
