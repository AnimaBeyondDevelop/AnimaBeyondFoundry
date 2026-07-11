import { describe, expect, it } from 'vitest';
import { calculateMassLifePoints, calculateMassMemberCountFromLife } from './calculateMassLifePoints.js';

describe('calculateMassLifePoints', () => {
  describe('without damage accumulation', () => {
    it('rounds individual PV down to groups of 50', () => {
      expect(
        calculateMassLifePoints({ individualLife: 130, memberCount: 1, damageAccumulation: false })
      ).toBe(100);
      expect(
        calculateMassLifePoints({ individualLife: 190, memberCount: 1, damageAccumulation: false })
      ).toBe(150);
    });

    it('sums rounded PV for up to 100 members', () => {
      expect(
        calculateMassLifePoints({ individualLife: 130, memberCount: 10, damageAccumulation: false })
      ).toBe(1000);
      expect(
        calculateMassLifePoints({ individualLife: 130, memberCount: 18, damageAccumulation: false })
      ).toBe(1800);
      expect(
        calculateMassLifePoints({ individualLife: 130, memberCount: 100, damageAccumulation: false })
      ).toBe(10000);
    });

    it('adds reduced contribution per member beyond 100', () => {
      expect(
        calculateMassLifePoints({ individualLife: 130, memberCount: 101, damageAccumulation: false })
      ).toBe(10010);
      expect(
        calculateMassLifePoints({ individualLife: 250, memberCount: 102, damageAccumulation: false })
      ).toBe(25050);
    });
  });

  describe('with damage accumulation', () => {
    it('uses base PV rounded down to groups of 100', () => {
      expect(
        calculateMassLifePoints({ individualLife: 150, memberCount: 1, damageAccumulation: true })
      ).toBe(100);
    });

    it('adds half the base for each additional member up to 50', () => {
      expect(
        calculateMassLifePoints({ individualLife: 200, memberCount: 2, damageAccumulation: true })
      ).toBe(300);
      expect(
        calculateMassLifePoints({ individualLife: 200, memberCount: 50, damageAccumulation: true })
      ).toBe(5100);
    });

    it('adds reduced contribution per member beyond 50', () => {
      expect(
        calculateMassLifePoints({ individualLife: 200, memberCount: 51, damageAccumulation: true })
      ).toBe(5200);
      expect(
        calculateMassLifePoints({ individualLife: 1000, memberCount: 51, damageAccumulation: true })
      ).toBe(25750);
    });
  });

  it('returns 0 for invalid inputs', () => {
    expect(calculateMassLifePoints({ individualLife: 0, memberCount: 10 })).toBe(0);
    expect(calculateMassLifePoints({ individualLife: 100, memberCount: 0 })).toBe(0);
  });
});

describe('calculateMassMemberCountFromLife', () => {
  describe('without damage accumulation', () => {
    it('inverts the rounded-PV mass life formula', () => {
      const params = { individualLife: 130, damageAccumulation: false };

      expect(
        calculateMassMemberCountFromLife({
          ...params,
          currentLife: calculateMassLifePoints({ ...params, memberCount: 18 })
        })
      ).toBe(18);
    });

    it('counts a partial last member when life is not an exact multiple', () => {
      expect(
        calculateMassMemberCountFromLife({
          individualLife: 130,
          currentLife: 17 * 100 + 1,
          damageAccumulation: false
        })
      ).toBe(18);
    });

    it('handles members beyond the first 100', () => {
      const params = { individualLife: 130, damageAccumulation: false };

      expect(
        calculateMassMemberCountFromLife({
          ...params,
          currentLife: calculateMassLifePoints({ ...params, memberCount: 101 })
        })
      ).toBe(101);
    });
  });

  describe('with damage accumulation', () => {
    it('inverts the accumulation mass life formula', () => {
      const params = { individualLife: 200, damageAccumulation: true };

      expect(
        calculateMassMemberCountFromLife({
          ...params,
          currentLife: calculateMassLifePoints({ ...params, memberCount: 2 })
        })
      ).toBe(2);
    });

    it('handles members beyond the first 50', () => {
      const params = { individualLife: 200, damageAccumulation: true };

      expect(
        calculateMassMemberCountFromLife({
          ...params,
          currentLife: calculateMassLifePoints({ ...params, memberCount: 51 })
        })
      ).toBe(51);
    });
  });

  it('returns 0 when there is no remaining life', () => {
    expect(
      calculateMassMemberCountFromLife({ individualLife: 100, currentLife: 0 })
    ).toBe(0);
  });
});

describe('mass life round-trip', () => {
  const cases = [
    { individualLife: 130, memberCount: 18, damageAccumulation: false },
    { individualLife: 130, memberCount: 101, damageAccumulation: false },
    { individualLife: 250, memberCount: 102, damageAccumulation: false },
    { individualLife: 200, memberCount: 2, damageAccumulation: true },
    { individualLife: 200, memberCount: 50, damageAccumulation: true },
    { individualLife: 200, memberCount: 51, damageAccumulation: true }
  ];

  it.each(cases)(
    'recovers member count from life for %#',
    ({ individualLife, memberCount, damageAccumulation }) => {
      const currentLife = calculateMassLifePoints({
        individualLife,
        memberCount,
        damageAccumulation
      });

      expect(
        calculateMassMemberCountFromLife({
          individualLife,
          currentLife,
          damageAccumulation
        })
      ).toBe(memberCount);
    }
  );
});
