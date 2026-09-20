import {describe, expect, it} from 'vitest';

import type {Player} from '@soul/shared';

import {createGame} from '../../src/game/createGame';
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
		const game = createGame(
			'game-1',
			[
				player1,
				player2,
				player3
			]
		);
		
		const playingGame = {
			...game,
			status: 'playing' as const,
			currentPlayerId: player1.id,
			turnNumber: 1
		};
		
		const result = nextTurn(
			playingGame
		);
		
		expect(result.currentPlayerId).toBe(
			'player-2'
		);
		
		expect(result.turnNumber).toBe(2);
	});
	
	it('после последнего игрока возвращает ход первому', () => {
		const game = createGame(
			'game-1',
			[
				player1,
				player2,
				player3
			]
		);
		
		const playingGame = {
			...game,
			status: 'playing' as const,
			currentPlayerId: player3.id,
			turnNumber: 3
		};
		
		const result = nextTurn(
			playingGame
		);
		
		expect(result.currentPlayerId).toBe(
			'player-1'
		);
		
		expect(result.turnNumber).toBe(4);
	});
});