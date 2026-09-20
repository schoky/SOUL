import type {EventCard, EventDeck} from '@soul/shared';
import {refillEventDeck} from './refillEventDeck.js';

export function drawEvent(
	deck: EventDeck,
	random: () => number = Math.random
): EventCard {
	refillEventDeck(deck, random);
	
	if (deck.drawPile.length === 0) {
		throw new Error(
			'Cannot draw event: event deck is empty'
		);
	}
	
	const index = Math.floor(
		random() * deck.drawPile.length
	);
	
	const [event] = deck.drawPile.splice(index, 1);
	
	deck.discardPile.push(event);
	
	return event;
}