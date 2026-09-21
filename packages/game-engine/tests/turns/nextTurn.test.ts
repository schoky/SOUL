import {
	describe,
	expect,
	it
} from 'vitest';

import type {Player} from '@soul/shared';

import {nextTurn} from '../../src/game/nextTurn';

const player1: Player = {
	id: 'player-1',
	name: 'Игрок 1',
	soul: 0,
	characters: [],
	status: null,
	isReady: false,
	skipNextTurn: false
};

const player2: Player = {
	id: 'player-2',
	name: 'Игрок 2',
	soul: 0,
	characters: [],
	status: null,
	isReady: false,
	skipNextTurn: false
};

const player3: Player = {
	id: 'player-3',
	name: 'Игрок 3',
	soul: 0,
	characters: [],
	status: null,
	isReady: false,
	skipNextTurn: false
};

describe('nextTurn', () => {
	it('передаёт ход следующему игроку', () => {
		const game = {
			id: 'game-1',
			status: 'playing' as const,
			players: [
				player1,
				player2,
				player3
			],
			currentPlayerId: 'player-1',
			currentEvent: null,
			eventDeck: {
				drawPile: [],
				discardPile: []
			},
			turnNumber: 1,
			winnerId: null,
			finalRoundStartedBy: null
		};
		
		const result = nextTurn(
			game
		);
		
		expect(
			result.currentPlayerId
		).toBe('player-2');
		
		expect(
			result.turnNumber
		).toBe(2);
	});
	
	it('после последнего игрока возвращает ход первому', () => {
		const game = {
			id: 'game-1',
			status: 'playing' as const,
			players: [
				player1,
				player2,
				player3
			],
			currentPlayerId: 'player-3',
			currentEvent: null,
			eventDeck: {
				drawPile: [],
				discardPile: []
			},
			turnNumber: 3,
			winnerId: null,
			finalRoundStartedBy: null
		};
		
		const result = nextTurn(
			game
		);
		
		expect(
			result.currentPlayerId
		).toBe('player-1');
		
		expect(
			result.turnNumber
		).toBe(4);
	});
});