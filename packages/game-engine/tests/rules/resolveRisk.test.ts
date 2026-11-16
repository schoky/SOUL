import { describe, expect, it } from 'vitest';

import { resolveRisk } from '../../src/rules/resolveRisk';

describe('resolveRisk', () => {
  it('при выполненной базе шанс 50%', () => {
    // 0.49 < 0.5 → успех
    expect(resolveRisk(true, () => 0.49)).toBe(true);

    // 0.5 >= 0.5 → провал
    expect(resolveRisk(true, () => 0.5)).toBe(false);

    expect(resolveRisk(true, () => 0.99)).toBe(false);
  });

  it('при невыполненной базе шанс 25%', () => {
    // 0.24 < 0.25 → успех
    expect(resolveRisk(false, () => 0.24)).toBe(true);

    // 0.25 >= 0.25 → провал
    expect(resolveRisk(false, () => 0.25)).toBe(false);

    // 0.49 < 0.5, но >= 0.25 → всё равно провал
    expect(resolveRisk(false, () => 0.49)).toBe(false);

    expect(resolveRisk(false, () => 0.99)).toBe(false);
  });
});
