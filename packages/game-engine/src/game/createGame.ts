import type { EventCard, GameState, Player } from '@soul/shared';

import { createEventDeck } from '../deck/createEventDeck.js';

export function createGame(
  gameId: string,
  players: Player[],
  events: EventCard[],
  random: () => number = Math.random
): GameState {
  const eventDeck = createEventDeck(events, random);

  return {
    id: gameId,
    status: 'waiting',
    players,
    characters: [],
    currentPlayerId: null,
    currentEvent: null,
    eventDeck,
    turnNumber: 0,
    winnerId: null,
    finalRoundStartedBy: null
  };
}
