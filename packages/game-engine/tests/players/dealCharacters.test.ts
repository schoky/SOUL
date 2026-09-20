import {describe, expect, it} from 'vitest';

import type {
	Character,
	Player
} from '@soul/shared';

import {dealCharacters} from '../../src/players/dealCharacters';

const characters: Character[] = [
	{
		id: 'character-1',
		name: 'Персонаж 1',
		stats: {
			farmila: 1,
			perekup: 2,
			tuller: 3
		}
	},
	{
		id: 'character-2',
		name: 'Персонаж 2',
		stats: {
			farmila: 4,
			perekup: 5,
			tuller: 6
		}
	},
	{
		id: 'character-3',
		name: 'Персонаж 3',
		stats: {
			farmila: 7,
			perekup: 8,
			tuller: 9
		}
	},
	{
		id: 'character-4',
		name: 'Персонаж 4',
		stats: {
			farmila: 2,
			perekup: 3,
			tuller: 4
		}
	}
];

const players: Player[] = [
	{
		id: 'player-1',
		name: 'Игрок 1',
		soul: 3,
		characters: [],
		status: null,
		skipNextTurn: false,
		isReady: true
	},
	{
		id: 'player-2',
		name: 'Игрок 2',
		soul: 3,
		characters: [],
		status: null,
		skipNextTurn: false,
		isReady: true
	}
];

describe('dealCharacters', () => {
	it('выдаёт каждому игроку по 2 персонажа', () => {
		const result = dealCharacters(
			players,
			characters,
			() => 0
		);
		
		expect(result[0].characters)
		.toHaveLength(2);
		
		expect(result[1].characters)
		.toHaveLength(2);
	});
	
	it('не выдаёт одного персонажа двум игрокам', () => {
		const result = dealCharacters(
			players,
			characters,
			() => 0
		);
		
		const characterIds = result.flatMap(
			(player) =>
				player.characters.map(
					(character) =>
						character.id
				)
		);
		
		expect(
			new Set(characterIds).size
		).toBe(characterIds.length);
	});
	
	it('не изменяет исходный массив персонажей', () => {
		const originalCharacters = [
			...characters
		];
		
		dealCharacters(
			players,
			characters,
			() => 0
		);
		
		expect(characters).toEqual(
			originalCharacters
		);
	});
	
	it('выбрасывает ошибку при недостатке персонажей', () => {
		expect(() => {
			dealCharacters(
				players,
				characters.slice(0, 3)
			);
		}).toThrow(
			'Not enough characters'
		);
	});
});