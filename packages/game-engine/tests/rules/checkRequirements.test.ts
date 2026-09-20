import {describe, expect, it} from 'vitest';

import {characters} from '../../src/data/characters';
import {events} from '../../src/data/events';
import {checkRequirements} from '../../src/rules/checkRequirements';

describe('checkRequirements', () => {
	it('возвращает true, если персонаж соответствует всем требованиям', () => {
		const killer = characters.find(
			(character) => character.id === 'killer'
		);
		
		const raid = events.find(
			(event) => event.id === 'raid-on-warehouse'
		);
		
		if (!killer || !raid) {
			throw new Error('Тестовые данные не найдены');
		}
		
		expect(checkRequirements(killer, raid)).toBe(true);
	});
	
	it('возвращает false, если хотя бы одна характеристика ниже требования', () => {
		const workaholic = characters.find(
			(character) => character.id === 'workaholic'
		);
		
		const raid = events.find(
			(event) => event.id === 'raid-on-warehouse'
		);
		
		if (!workaholic || !raid) {
			throw new Error('Тестовые данные не найдены');
		}
		
		expect(checkRequirements(workaholic, raid)).toBe(false);
	});
});