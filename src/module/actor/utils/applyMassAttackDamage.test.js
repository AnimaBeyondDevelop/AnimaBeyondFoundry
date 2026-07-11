import { describe, expect, it } from 'vitest';
import {
  combineMassAttackDamage,
  resolveMassPhysicalDamage,
  resolveMassSupernaturalDamage
} from './applyMassAttackDamage.js';

const massActor = {
  system: { general: { settings: { massOfEnemies: { value: true } } } }
};

const normalActor = {
  system: { general: { settings: { massOfEnemies: { value: false } } } }
};

describe('resolveMassPhysicalDamage', () => {
  it('increases base damage by 50% for masses', () => {
    expect(resolveMassPhysicalDamage(massActor, 60)).toBe(90);
    expect(resolveMassPhysicalDamage(massActor, 65)).toBe(97);
  });

  it('leaves damage unchanged for non-mass actors', () => {
    expect(resolveMassPhysicalDamage(normalActor, 60)).toBe(60);
  });
});

describe('resolveMassSupernaturalDamage', () => {
  it('doubles base damage for masses', () => {
    expect(resolveMassSupernaturalDamage(massActor, 40)).toBe(80);
  });

  it('leaves damage unchanged for non-mass actors', () => {
    expect(resolveMassSupernaturalDamage(normalActor, 40)).toBe(40);
  });
});

describe('combineMassAttackDamage', () => {
  it('adds special damage after scaling physical base damage', () => {
    expect(combineMassAttackDamage(massActor, 60, 5)).toBe(95);
  });

  it('adds special damage after doubling supernatural base damage', () => {
    expect(
      combineMassAttackDamage(massActor, 40, 10, { supernatural: true })
    ).toBe(90);
  });
});
