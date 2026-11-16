import { describe, expect, it } from 'vitest';

import { events } from '../../src/data/events.js';
import { createEventDeck } from '../../src/deck/createEventDeck.js';
import { drawEvent } from '../../src/deck/drawEvent.js';

describe('drawEvent', () => {
  it('вытягивает первое событие из drawPile', () => {
    const deck = createEventDeck(events, () => 0);

    const expectedEvent = deck.drawPile[0];

    const initialDrawPileSize = deck.drawPile.length;

    const event = drawEvent(deck, () => 0);

    expect(event).toBe(expectedEvent);

    expect(deck.drawPile).toHaveLength(initialDrawPileSize - 1);
  });

  it('перемещает вытянутое событие в discardPile', () => {
    const deck = createEventDeck(events);

    const event = drawEvent(deck, () => 0);

    expect(deck.discardPile).toHaveLength(1);
    expect(deck.discardPile[0]).toBe(event);
  });

  it('выбрасывает ошибку, если вся колода пуста', () => {
    const deck = createEventDeck([]);

    expect(() => {
      drawEvent(deck);
    }).toThrow('Cannot draw event: event deck is empty');
  });

  it('восстанавливает drawPile из discardPile', () => {
    const deck = createEventDeck(events, () => 0);

    const discardedEvents = [...deck.drawPile];

    deck.drawPile.length = 0;
    deck.discardPile.push(...discardedEvents);

    const event = drawEvent(deck, () => 0);

    expect(discardedEvents).toContain(event);

    expect(deck.drawPile).toHaveLength(discardedEvents.length - 1);

    expect(deck.discardPile).toHaveLength(1);
  });
});
