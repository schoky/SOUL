import { describe, expect, it } from 'vitest';

import { changeSoul } from '../../src/rules/changeSoul';

describe('changeSoul', () => {
  it('увеличивает количество Soul', () => {
    expect(changeSoul(3, 2)).toBe(5);
  });

  it('уменьшает количество Soul', () => {
    expect(changeSoul(5, -2)).toBe(3);
  });

  it('не позволяет Soul стать меньше нуля', () => {
    expect(changeSoul(1, -2)).toBe(0);
  });

  it('не меняет Soul при изменении на ноль', () => {
    expect(changeSoul(5, 0)).toBe(5);
  });
});
