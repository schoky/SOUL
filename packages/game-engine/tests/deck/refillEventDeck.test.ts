import { describe, expect, it } from 'vitest';

import { createEventDeck } from '../../src/deck/createEventDeck.js';
import { refillEventDeck } from '../../src/deck/refillEventDeck.js';

describe('refillEventDeck', () => {
  it('перемещает discardPile обратно в drawPile', () => {
    const events = [
      {
        id: 'event-1',
        name: 'Event 1',
        requirements: {
          farmila: 1,
          perekup: 1,
          tuller: 1
        },
        mainStat: 'farmila' as const,
        reward: 1,
        description: 'Event 1'
      },
      {
        id: 'event-2',
        name: 'Event 2',
        requirements: {
          farmila: 2,
          perekup: 2,
          tuller: 2
        },
        mainStat: 'perekup' as const,
        reward: 1,
        description: 'Event 2'
      }
    ];

    const deck = createEventDeck(events, () => 0);

    const firstEvent = deck.drawPile.pop()!;
    const secondEvent = deck.drawPile.pop()!;

    deck.discardPile.push(firstEvent, secondEvent);

    expect(deck.drawPile).toHaveLength(0);
    expect(deck.discardPile).toHaveLength(2);

    refillEventDeck(deck, () => 0);

    expect(deck.drawPile).toHaveLength(2);
    expect(deck.discardPile).toHaveLength(0);

    expect(deck.drawPile).toEqual(expect.arrayContaining(events));
  });

  it('ничего не делает, если drawPile не пуст', () => {
    const events = [
      {
        id: 'event-1',
        name: 'Event 1',
        requirements: {
          farmila: 1,
          perekup: 1,
          tuller: 1
        },
        mainStat: 'farmila' as const,
        reward: 1,
        description: 'Event 1'
      }
    ];

    const deck = createEventDeck(events, () => 0);

    const originalDrawPile = [...deck.drawPile];

    refillEventDeck(deck, () => 0);

    expect(deck.drawPile).toEqual(originalDrawPile);

    expect(deck.discardPile).toHaveLength(0);
  });

  it('ничего не делает, если drawPile и discardPile пусты', () => {
    const deck = createEventDeck([]);

    refillEventDeck(deck);

    expect(deck.drawPile).toHaveLength(0);
    expect(deck.discardPile).toHaveLength(0);
  });
});
