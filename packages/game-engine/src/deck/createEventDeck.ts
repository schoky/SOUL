import type { EventCard, EventDeck } from '@soul/shared';

import { shuffle } from './shuffle.js';

export function createEventDeck(
  events: EventCard[],
  random: () => number = Math.random
): EventDeck {
  return {
    drawPile: shuffle(events, random),
    discardPile: []
  };
}
