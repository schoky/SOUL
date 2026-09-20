import {describe, expect, it} from 'vitest';

import type {Player} from '@soul/shared';

import {events} from '../../src/data/events.js';
import {createGame} from '../../src/game/createGame.js';

const player: Player = {
	id: 'player-1',
	name: 'Игрок 1',
	soul: 0,
	characters: [],
	status: null,
	isReady: false,
	skipNextTurn: false
};

describe('createGame', () => {
	it('создаёт игру в состоянии ожидания', () => {
		const game = createGame(
			'game-1',
			[player]
		);
		
		expect(game.id).toBe('game-1');
		expect(game.status).toBe('waiting');
		expect(game.players).toEqual([player]);
		expect(game.currentPlayerId).toBeNull();
		expect(game.currentEvent).toBeNull();
		expect(game.turnNumber).toBe(0);
		expect(game.winnerId).toBeNull();
	});
	
	it('создаёт колоду событий', () => {
		const game = createGame(
			'game-1',
			[player],
			() => 0
		);
		
		expect(game.eventDeck.drawPile).toHaveLength(
			events.length
		);
		
		expect(game.eventDeck.discardPile).toHaveLength(
			0
		);
	});
});