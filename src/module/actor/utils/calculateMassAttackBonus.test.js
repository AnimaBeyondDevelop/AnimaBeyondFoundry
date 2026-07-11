import { describe, expect, it } from 'vitest';
import {
  getMassAttackBonusFromMemberCount,
  resolveEffectiveMassMembersForAttackBonus,
  resolveMassAttackBonus
} from './calculateMassAttackBonus.js';

describe('getMassAttackBonusFromMemberCount', () => {
  it('returns the Table 1 bonus thresholds', () => {
    expect(getMassAttackBonusFromMemberCount(2)).toBe(0);
    expect(getMassAttackBonusFromMemberCount(3)).toBe(30);
    expect(getMassAttackBonusFromMemberCount(5)).toBe(50);
    expect(getMassAttackBonusFromMemberCount(100)).toBe(150);
  });
});

describe('resolveEffectiveMassMembersForAttackBonus', () => {
  it('splits members by target count', () => {
    expect(
      resolveEffectiveMassMembersForAttackBonus({
        memberCount: 100,
        targetCount: 4
      })
    ).toBe(25);
  });
});

describe('resolveMassAttackBonus', () => {
  it('reads mass settings from the actor', () => {
    const actor = {
      system: {
        general: {
          settings: {
            massOfEnemies: { value: true },
            massMemberCount: { value: 10 },
            organizedMass: { value: true }
          }
        }
      }
    };

    expect(resolveMassAttackBonus(actor, { targetCount: 1 })).toBe(70);
  });

  it('halves the bonus for unorganized masses', () => {
    const actor = {
      system: {
        general: {
          settings: {
            massOfEnemies: { value: true },
            massMemberCount: { value: 10 },
            organizedMass: { value: false }
          }
        }
      }
    };

    expect(resolveMassAttackBonus(actor, { targetCount: 1 })).toBe(35);
  });

  it('reduces the bonus when target count increases', () => {
    const actor = {
      system: {
        general: {
          settings: {
            massOfEnemies: { value: true },
            massMemberCount: { value: 100 },
            organizedMass: { value: true }
          }
        }
      }
    };

    expect(resolveMassAttackBonus(actor, { targetCount: 4 })).toBe(70);
  });
});
