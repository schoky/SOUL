import {describe, expect, it} from 'vitest';

import {events} from '../../src/data/events.js';
import {createEventDeck} from '../../src/deck/createEventDeck.js';

describe('createEventDeck', () => {
	it('создаёт колоду со всеми событиями', () => {
		const deck = createEventDeck(
			events,
			() => 0
		);
		
		expect(deck.drawPile).toHaveLength(
			events.length
		);
		
		expect(deck.discardPile).toHaveLength(0);
	});
	
	it('не изменяет исходный массив событий', () => {
		const originalEvents = [...events];
		
		const deck = createEventDeck(
			events,
			() => 0
		);
		
		deck.drawPile.pop();
		
		expect(events).toEqual(originalEvents);
	});
	
	it('сохраняет все события после перемешивания', () => {
		const deck = createEventDeck(
			events,
			() => 0
		);
		
		expect(deck.drawPile).toHaveLength(
			events.length
		);
		
		expect(deck.drawPile).toEqual(
			expect.arrayContaining(events)
		);
	});
});