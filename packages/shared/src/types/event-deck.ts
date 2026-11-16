import type { EventCard } from './event.js';

export type EventDeck = {
  drawPile: EventCard[];
  discardPile: EventCard[];
};
