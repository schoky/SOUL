import {describe, expect, it} from 'vitest';

import type {Player} from '@soul/shared';

import {characters} from '../../src/data/characters';
import {events} from '../../src/data/events';
import {resolveEvent} from '../../src/events/resolveEvent';

const player: Player = {
	id: 'player-1',
	name: 'Тестовый игрок',
	soul: 5,
	characters: [
		characters.find(
			(character) => character.id === 'killer'
		)!
	],
	status: null,
	isReady: false,
	skipNextTurn: false
};

describe('resolveEvent', () => {
	it('успешно выполняет событие и выдаёт награду', () => {
		const event = events.find(
			(item) => item.id === 'raid-on-warehouse'
		);
		
		if (!event) {
			throw new Error('Событие не найдено');
		}
		
		const result = resolveEvent(
			player,
			'killer',
			event
		);
		
		expect(result.success).toBe(true);
		expect(result.soul).toBe(7);
		expect(result.status).toBeNull();
		expect(result.skipNextTurn).toBe(false);
		expect(result.gambleWon).toBeNull();
	});
	
	it('не позволяет выполнить событие, если персонаж не соответствует требованиям', () => {
		const event = events.find(
			(item) => item.id === 'night-shift'
		);
		
		if (!event) {
			throw new Error('Событие не найдено');
		}
		
		const result = resolveEvent(
			player,
			'killer',
			event
		);
		
		expect(result.success).toBe(false);
	});
	
	it('выбрасывает ошибку, если персонаж отсутствует у игрока', () => {
		const event = events.find(
			(item) => item.id === 'raid-on-warehouse'
		);
		
		if (!event) {
			throw new Error('Событие не найдено');
		}
		
		expect(() => {
			resolveEvent(
				player,
				'unknown-character',
				event
			);
		}).toThrow('Character "unknown-character" not found');
	});
});