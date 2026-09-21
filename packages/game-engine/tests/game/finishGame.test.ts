import {
	describe,
	expect,
	it
} from 'vitest';

import type {Player} from '@soul/shared';

import {createGame} from '../../src/game/createGame';
import {finishGame} from '../../src/game/finishGame';

const player1: Player = {
	id: 'player-1',
	name: 'Игрок 1',
	soul: 18,
	characters: [],
	status: null,
	isReady: false,
	skipNextTurn: false
};

const player2: Player = {
	id: 'player-2',
	name: 'Игрок 2',
	soul: 16,
	characters: [],
	status: null,
	isReady: false,
	skipNextTurn: false
};

describe('finishGame', () => {
	it('завершает игру и записывает победителя', () => {
		const game = {
			...createGame(
				'game-1',
				[player1, player2]
			),
			status: 'playing' as const,
			finalRoundStartedBy:
			player1.id,
			currentPlayerId:
			player2.id
		};
		
		const result =
			finishGame(game);
		
		expect(
			result.status
		).toBe('finished');
		
		expect(
			result.winnerId
		).toBe(player1.id);
		
		expect(
			result.currentPlayerId
		).toBeNull();
		
		expect(
			result.currentEvent
		).toBeNull();
	});
	
	it('не позволяет завершить уже завершённую игру', () => {
		const game = {
			...createGame(
				'game-1',
				[player1, player2]
			),
			status: 'finished' as const
		};
		
		expect(() => {
			finishGame(game);
		}).toThrow(
			'Cannot finish game: game is not playing'
		);
	});
});