import {describe, expect, it} from 'vitest';

import type {
	EventCard,
	Player,
	PlayerCharacter
} from '@soul/shared';

import {events} from '../../src/data/events';
import {resolveEvent} from '../../src/events/resolveEvent';

const killerCard: PlayerCharacter = {
	cardId: 'player-1-character-1',
	characterId: 'killer',
	exhausted: false,
	abilityUsed: false
};

const workaholicCard: PlayerCharacter = {
	cardId: 'player-1-character-2',
	characterId: 'workaholic',
	exhausted: false,
	abilityUsed: false
};

const player: Player = {
	id: 'player-1',
	name: 'Тестовый игрок',
	soul: 5,
	characters: [
		killerCard,
		workaholicCard
	],
	status: null,
	isReady: false,
	skipNextTurn: false
};

describe('resolveEvent', () => {
	it('успешно выполняет событие одним персонажем', () => {
		const event = events.find(
			(item) =>
				item.id ===
				'raid-on-warehouse'
		);
		
		if (!event) {
			throw new Error(
				'Событие не найдено'
			);
		}
		
		const result = resolveEvent(
			player,
			[
				'player-1-character-1'
			],
			event
		);
		
		expect(result.success).toBe(true);
		expect(result.soul).toBe(7);
		expect(result.status).toBeNull();
		expect(result.skipNextTurn).toBe(false);
		expect(result.gambleWon).toBeNull();
		expect(result.riskWon).toBeNull();
	});
	
	it('успешно выполняет событие связкой двух персонажей и применяет способность', () => {
		const event: EventCard = {
			id: 'combo-event',
			name: 'Тестовая связка',
			requirements: {
				farmila: 8,
				perekup: 4,
				tuller: 6
			},
			mainStat: 'farmila',
			reward: 2,
			riskReward: 4,
			description:
				'Событие для проверки связки.'
		};
		
		const result = resolveEvent(
			player,
			[
				'player-1-character-1',
				'player-1-character-2'
			],
			event
		);
		
		expect(result.success).toBe(true);
		expect(result.soul).toBe(8);
		expect(result.riskWon).toBeNull();
	});
	
	it('не позволяет выполнить событие, если выбранный персонаж не соответствует требованиям', () => {
		const event = events.find(
			(item) =>
				item.id === 'night-shift'
		);
		
		if (!event) {
			throw new Error(
				'Событие не найдено'
			);
		}
		
		const result = resolveEvent(
			player,
			[
				'player-1-character-1'
			],
			event
		);
		
		expect(result.success).toBe(false);
		expect(result.riskWon).toBeNull();
	});
	
	it('выбрасывает ошибку, если карта персонажа отсутствует у игрока', () => {
		const event = events.find(
			(item) =>
				item.id ===
				'raid-on-warehouse'
		);
		
		if (!event) {
			throw new Error(
				'Событие не найдено'
			);
		}
		
		expect(() => {
			resolveEvent(
				player,
				[
					'unknown-character-card'
				],
				event
			);
		}).toThrow(
			'Character card "unknown-character-card" not found'
		);
	});
	
	it('не позволяет использовать уставшую карту персонажа', () => {
		const exhaustedPlayer: Player = {
			...player,
			characters: [
				{
					...killerCard,
					exhausted: true
				},
				workaholicCard
			]
		};
		
		const event = events.find(
			(item) =>
				item.id ===
				'raid-on-warehouse'
		);
		
		if (!event) {
			throw new Error(
				'Событие не найдено'
			);
		}
		
		expect(() => {
			resolveEvent(
				exhaustedPlayer,
				[
					'player-1-character-1'
				],
				event
			);
		}).toThrow(
			'Character card "player-1-character-1" is exhausted'
		);
	});
	
	it('выигрывает риск и получает повышенную награду', () => {
		const event = events.find(
			(item) =>
				item.id ===
				'raid-on-warehouse'
		);
		
		if (!event) {
			throw new Error(
				'Событие не найдено'
			);
		}
		
		const result = resolveEvent(
			player,
			[
				'player-1-character-1'
			],
			event,
			true,
			() => 0
		);
		
		expect(result.success).toBe(true);
		expect(result.riskWon).toBe(true);
		expect(result.soul).toBe(9);
	});
	
	it('проигрывает риск и получает эффект основной характеристики', () => {
		const event = events.find(
			(item) =>
				item.id ===
				'raid-on-warehouse'
		);
		
		if (!event) {
			throw new Error(
				'Событие не найдено'
			);
		}
		
		const result = resolveEvent(
			player,
			[
				'player-1-character-1'
			],
			event,
			true,
			() => 0.99
		);
		
		expect(result.success).toBe(false);
		expect(result.riskWon).toBe(false);
		expect(result.status).toBe(
			'za-kafan'
		);
	});
	
	it('не позволяет выбрать риск при невыполненных требованиях', () => {
		const event = events.find(
			(item) =>
				item.id === 'night-shift'
		);
		
		if (!event) {
			throw new Error(
				'Событие не найдено'
			);
		}
		
		expect(() => {
			resolveEvent(
				player,
				[
					'player-1-character-1'
				],
				event,
				true,
				() => 0
			);
		}).toThrow(
			'Cannot risk event: requirements are not met'
		);
	});
});