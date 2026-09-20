import {describe, expect, it} from 'vitest';

import type {GameState, Player} from '@soul/shared';

import {characters} from '../../src/data/characters';
import {events} from '../../src/data/events';
import {playEvent} from '../../src/game/playEvent';

const killer = characters.find(
	(character) => character.id === 'killer'
)!;

const player: Player = {
	id: 'player-1',
	name: 'Игрок 1',
	soul: 5,
	characters: [killer],
	status: null,
	isReady: false,
	skipNextTurn: false
};

function createPlayingGame(): GameState {
	const event = events.find(
		(item) => item.id === 'raid-on-warehouse'
	)!;
	
	return {
		id: 'game-1',
		status: 'playing',
		players: [player],
		currentPlayerId: player.id,
		currentEvent: event,
		turnNumber: 1,
		winnerId: null
	};
}

describe('playEvent', () => {
	it('изменяет Soul текущего игрока после успешного события', () => {
		const game = createPlayingGame();
		
		const result = playEvent(
			game,
			'killer'
		);
		
		expect(result.success).toBe(true);
		expect(result.gambleWon).toBeNull();
		
		expect(
			result.game.players[0].soul
		).toBe(7);
	});
	
	it('не изменяет исходный GameState', () => {
		const game = createPlayingGame();
		
		playEvent(
			game,
			'killer'
		);
		
		expect(
			game.players[0].soul
		).toBe(5);
	});
	
	it('выбрасывает ошибку, если игра не запущена', () => {
		const game = {
			...createPlayingGame(),
			status: 'waiting' as const
		};
		
		expect(() => {
			playEvent(game, 'killer');
		}).toThrow(
			'Cannot play event: game is not playing'
		);
	});
	
	it('выбрасывает ошибку, если нет текущего события', () => {
		const game = {
			...createPlayingGame(),
			currentEvent: null
		};
		
		expect(() => {
			playEvent(game, 'killer');
		}).toThrow(
			'Cannot play event: current event is not set'
		);
	});
});