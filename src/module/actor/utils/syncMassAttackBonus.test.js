import { describe, expect, it, vi } from 'vitest';
import {
  augmentActorChangesWithMassAttackBonus,
  buildMassAttackBonusUpdate,
  resolveMassAttackBonusForActor
} from './syncMassAttackBonus.js';

vi.stubGlobal('foundry', {
  utils: {
    deepClone: value => structuredClone(value)
  }
});

const massActor = {
  system: {
    general: {
      settings: {
        massOfEnemies: { value: true },
        massMemberCount: { value: 10 },
        organizedMass: { value: true },
        massAttackBonus: { value: 0 }
      }
    }
  }
};

describe('resolveMassAttackBonusForActor', () => {
  it('returns the Table 1 bonus for a mass actor', () => {
    expect(resolveMassAttackBonusForActor(massActor)).toBe(70);
  });

  it('returns 0 when the actor is not a mass', () => {
    expect(
      resolveMassAttackBonusForActor({
        system: {
          general: {
            settings: {
              massOfEnemies: { value: false },
              massMemberCount: { value: 10 }
            }
          }
        }
      })
    ).toBe(0);
  });
});

describe('buildMassAttackBonusUpdate', () => {
  it('returns null when no mass-related change is pending', () => {
    expect(
      buildMassAttackBonusUpdate(
        {
          system: {
            general: {
              settings: {
                massOfEnemies: { value: false }
              }
            }
          }
        },
        {}
      )
    ).toBeNull();
  });

  it('returns an update when mass settings change', () => {
    expect(
      buildMassAttackBonusUpdate(massActor, {
        'system.general.settings.organizedMass.value': false
      })
    ).toEqual({
      'system.general.settings.massAttackBonus.value': 35
    });
  });
});

describe('augmentActorChangesWithMassAttackBonus', () => {
  it('merges the bonus update into actor changes', () => {
    const result = augmentActorChangesWithMassAttackBonus(
      { 'system.general.settings.organizedMass.value': false },
      massActor
    );

    expect(result['system.general.settings.massAttackBonus.value']).toBe(35);
  });
});
