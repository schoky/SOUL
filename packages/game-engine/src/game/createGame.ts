import type {GameState, Player} from '@soul/shared';

import {events} from '../data/events.js';
import {createEventDeck} from '../deck/createEventDeck.js';

export function createGame(
	gameId: string,
	players: Player[],
	random: () => number = Math.random
): GameState {
	const eventDeck = createEventDeck(
		events,
		random
	);
	
	return {
		id: gameId,
		status: 'waiting',
		players,
		currentPlayerId: null,
		currentEvent: null,
		eventDeck,
		turnNumber: 0,
		winnerId: null
	};
}