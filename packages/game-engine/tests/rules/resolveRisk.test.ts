import {describe, expect, it} from 'vitest';

import {resolveRisk} from '../../src/rules/resolveRisk';

describe('resolveRisk', () => {
	it('возвращает успех при результате меньше 0.5', () => {
		expect(
			resolveRisk(() => 0.49)
		).toBe(true);
	});
	
	it('возвращает проигрыш при результате 0.5 и выше', () => {
		expect(
			resolveRisk(() => 0.5)
		).toBe(false);
		
		expect(
			resolveRisk(() => 0.99)
		).toBe(false);
	});
});