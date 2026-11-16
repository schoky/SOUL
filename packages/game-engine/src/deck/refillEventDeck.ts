import type { EventDeck } from '@soul/shared';

import { shuffle } from './shuffle.js';

export function refillEventDeck(deck: EventDeck, random: () => number = Math.random): void {
  if (deck.drawPile.length > 0) {
    return;
  }

  if (deck.discardPile.length === 0) {
    return;
  }

  const shuffledDiscard = shuffle(deck.discardPile, random);

  deck.drawPile.push(...shuffledDiscard);
  deck.discardPile.length = 0;
}
