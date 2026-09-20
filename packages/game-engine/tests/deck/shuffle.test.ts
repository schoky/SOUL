import {describe, expect, it} from 'vitest';

import {shuffle} from '../../src/deck/shuffle.js';

describe('shuffle', () => {
	it('возвращает все элементы', () => {
		const items = ['A', 'B', 'C', 'D'];
		
		const result = shuffle(
			items,
			() => 0.5
		);
		
		expect(result).toHaveLength(
			items.length
		);
		
		expect(result).toEqual(
			expect.arrayContaining(items)
		);
	});
	
	it('не изменяет исходный массив', () => {
		const items = ['A', 'B', 'C', 'D'];
		
		shuffle(
			items,
			() => 0.5
		);
		
		expect(items).toEqual([
			'A',
			'B',
			'C',
			'D'
		]);
	});
	
	it('может изменить порядок элементов', () => {
		const items = ['A', 'B', 'C', 'D'];
		
		const result = shuffle(
			items,
			() => 0
		);
		
		expect(result).not.toEqual(items);
	});
});