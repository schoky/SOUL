import {describe, expect, it} from 'vitest';

import type {
	CharacterStats,
	EventCard
} from '@soul/shared';

import {checkRequirements} from '../../src/rules/checkRequirements';

const stats: CharacterStats = {
	farmila: 5,
	perekup: 4,
	tuller: 7
};

const event: EventCard = {
	id: 'test-event',
	name: 'Тестовое событие',
	requirements: {
		farmila: 5,
		perekup: 3,
		tuller: 7
	},
	mainStat: 'tuller',
	reward: 2,
	description: 'Тестовое событие.'
};

describe('checkRequirements', () => {
	it('возвращает true, если все характеристики соответствуют требованиям', () => {
		expect(
			checkRequirements(
				stats,
				event
			)
		).toBe(true);
	});
	
	it('возвращает false, если хотя бы одна характеристика недостаточна', () => {
		const insufficientStats: CharacterStats = {
			farmila: 5,
			perekup: 2,
			tuller: 7
		};
		
		expect(
			checkRequirements(
				insufficientStats,
				event
			)
		).toBe(false);
	});
});