import {describe, expect, it} from 'vitest';

import {GAME_RULES} from '@soul/shared';

import {createPlayer} from '../../src/players/createPlayer';

describe('createPlayer', () => {
	it('создаёт игрока с начальными параметрами', () => {
		const player = createPlayer(
			'player-1',
			'Игрок 1'
		);
		
		expect(player.id).toBe(
			'player-1'
		);
		
		expect(player.name).toBe(
			'Игрок 1'
		);
		
		expect(player.soul).toBe(
			GAME_RULES.STARTING_SOUL
		);
		
		expect(player.characters).toEqual([]);
		
		expect(player.status).toBeNull();
		
		expect(player.skipNextTurn).toBe(
			false
		);
		
		expect(player.isReady).toBe(
			false
		);
	});
});