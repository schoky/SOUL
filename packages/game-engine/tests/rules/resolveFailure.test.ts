import {describe, expect, it} from 'vitest';

import type {Player} from '@soul/shared';

import {events} from '../../src/data/events';
import {resolveFailure} from '../../src/rules/resolveFailure';

const player: Player = {
	id: 'player-1',
	name: 'Тестовый игрок',
	soul: 5,
	characters: [],
	status: null,
	isReady: false,
	skipNextTurn: false
};

describe('resolveFailure', () => {
	it('при провале по Туллеру устанавливает статус "Закафан" и отнимает 1 Soul', () => {
		const event = events.find(
			(item) => item.id === 'raid-on-warehouse'
		);
		
		if (!event) {
			throw new Error('Событие не найдено');
		}
		
		const result = resolveFailure(player, event);
		
		expect(result.soul).toBe(4);
		expect(result.status).toBe('za-kafan');
		expect(result.skipNextTurn).toBe(false);
		expect(result.gambleWon).toBeNull();
	});
	
	it('при выигрыше проверки Перекупа не отнимает Soul', () => {
		const event = events.find(
			(item) => item.id === 'resell-batch'
		);
		
		if (!event) {
			throw new Error('Событие не найдено');
		}
		
		const result = resolveFailure(
			player,
			event,
			() => 0.2
		);
		
		expect(result.soul).toBe(5);
		expect(result.status).toBe('v-prolete');
		expect(result.skipNextTurn).toBe(false);
		expect(result.gambleWon).toBe(true);
	});
	
	it('при проигрыше проверки Перекупа отнимает 2 Soul', () => {
		const event = events.find(
			(item) => item.id === 'resell-batch'
		);
		
		if (!event) {
			throw new Error('Событие не найдено');
		}
		
		const result = resolveFailure(
			player,
			event,
			() => 0.8
		);
		
		expect(result.soul).toBe(3);
		expect(result.status).toBe('v-prolete');
		expect(result.skipNextTurn).toBe(false);
		expect(result.gambleWon).toBe(false);
	});
	
	it('при провале по Фармиле устанавливает "Выгорание" и пропуск следующего хода', () => {
		const event = events.find(
			(item) => item.id === 'night-shift'
		);
		
		if (!event) {
			throw new Error('Событие не найдено');
		}
		
		const result = resolveFailure(player, event);
		
		expect(result.soul).toBe(5);
		expect(result.status).toBe('vygoranie');
		expect(result.skipNextTurn).toBe(true);
		expect(result.gambleWon).toBeNull();
	});
	
	it('Soul не может стать отрицательным', () => {
		const playerWithOneSoul: Player = {
			...player,
			soul: 1
		};
		
		const event = events.find(
			(item) => item.id === 'raid-on-warehouse'
		);
		
		if (!event) {
			throw new Error('Событие не найдено');
		}
		
		const result = resolveFailure(
			playerWithOneSoul,
			event
		);
		
		expect(result.soul).toBe(0);
	});
});