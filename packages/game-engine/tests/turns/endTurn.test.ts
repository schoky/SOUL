import {describe, expect, it} from 'vitest';

import type {Player} from '@soul/shared';

import {createGame} from '../../src/game/createGame';
import {endTurn} from '../../src/turns/endTurn';

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

describe('endTurn', () => {
	it('передаёт ход следующему игроку', () => {
		const game = createGame(
			'game-1',
			[player1, player2],
			() => 0
		);
		
		const startedGame = {
			...game,
			status: 'playing' as const,
			currentPlayerId: player1.id,
			turnNumber: 1
		};
		
		const result = endTurn(
			startedGame,
			() => 0
		);
		
		expect(result.currentPlayerId).toBe(
			player2.id
		);
		
		expect(result.turnNumber).toBe(2);
	});
	
	it('вытягивает новое событие для следующего хода', () => {
		const game = createGame(
			'game-1',
			[player1, player2],
			() => 0
		);
		
		const startedGame = {
			...game,
			status: 'playing' as const,
			currentPlayerId: player1.id,
			turnNumber: 1
		};
		
		const expectedEvent =
			startedGame.eventDeck.drawPile[0];
		
		const result = endTurn(
			startedGame,
			() => 0
		);
		
		expect(result.currentEvent).toBe(
			expectedEvent
		);
		
		expect(
			result.eventDeck.discardPile
		).toContain(expectedEvent);
	});
});