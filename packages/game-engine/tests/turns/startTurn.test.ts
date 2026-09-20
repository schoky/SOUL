import {describe, expect, it} from 'vitest';

import type {Player} from '@soul/shared';

import {createGame} from '../../src/game/createGame';
import {startTurn} from '../../src/turns/startTurn';

const normalPlayer: Player = {
	id: 'player-1',
	name: 'Игрок 1',
	soul: 5,
	characters: [],
	status: null,
	isReady: false,
	skipNextTurn: false
};

const exhaustedPlayer: Player = {
	id: 'player-1',
	name: 'Игрок 1',
	soul: 5,
	characters: [],
	status: 'vygoranie',
	isReady: false,
	skipNextTurn: true
};

function createPlayingGame(
	player: Player
) {
	const game = createGame(
		'game-1',
		[player]
	);
	
	return {
		...game,
		status: 'playing' as const,
		currentPlayerId: player.id,
		turnNumber: 1
	};
}

describe('startTurn', () => {
	it('обычный игрок получает ход', () => {
		const game = createPlayingGame(
			normalPlayer
		);
		
		const result = startTurn(game);
		
		expect(result.skipped).toBe(false);
		expect(result.player.id).toBe('player-1');
		expect(result.player.skipNextTurn).toBe(false);
	});
	
	it('игрок с Выгоранием пропускает ход', () => {
		const game = createPlayingGame(
			exhaustedPlayer
		);
		
		const result = startTurn(game);
		
		expect(result.skipped).toBe(true);
		expect(result.player.skipNextTurn).toBe(false);
		expect(result.player.status).toBeNull();
	});
});