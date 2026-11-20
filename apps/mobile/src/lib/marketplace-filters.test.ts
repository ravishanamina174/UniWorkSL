import { colomboDate, validPriceRange } from './marketplace-filters';

describe('marketplace filters', () => {
  it('uses the Sri Lankan day at UTC midnight boundaries', () => {
    expect(colomboDate(0, new Date('2026-11-19T18:29:59Z'))).toBe('2026-11-19');
    expect(colomboDate(0, new Date('2026-11-19T18:30:00Z'))).toBe('2026-11-20');
    expect(colomboDate(1, new Date('2026-11-19T18:30:00Z'))).toBe('2026-11-21');
  });

  it('rejects invalid ranges and accepts open bounds', () => {
    expect(validPriceRange(100, 200)).toBe(true);
    expect(validPriceRange(undefined, 200)).toBe(true);
    expect(validPriceRange(200, 100)).toBe(false);
    expect(validPriceRange(-1, 100)).toBe(false);
    expect(validPriceRange(Number.NaN, 100)).toBe(false);
  });
});
