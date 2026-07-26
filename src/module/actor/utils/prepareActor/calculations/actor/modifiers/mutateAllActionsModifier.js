import { calculateFatigue } from './calculations/calculateFatigue';
import { calculateNegativeLifePoints } from './calculations/calculateNegativeLifePoints';
import { applyWithstandPainMitigation } from './calculations/withstandPainMitigation';

/**
 * @param {{ base?: { value?: number }, special?: { value?: number }, multiplier?: { value?: number }, final?: { value?: number } }} penalty
 * @returns {number}
 */
function computePenaltyFinal(penalty) {
  const base = Number(penalty?.base?.value) || 0;
  const special = Number(penalty?.special?.value) || 0;
  const rawMultiplier = penalty?.multiplier?.value;
  const multiplier =
    rawMultiplier === undefined || rawMultiplier === null ? 1 : Number(rawMultiplier) || 0;
  return (base + special) * multiplier;
}

/**
 * Ensure penalty node shape exists on prepared data.
 * @param {object} penalties
 * @param {string} key
 */
function ensurePenalty(penalties, key) {
  if (!penalties[key] || typeof penalties[key] !== 'object') {
    penalties[key] = {
      base: { value: 0 },
      special: { value: 0 },
      multiplier: { value: 1 },
      final: { value: 0 }
    };
  }
  const p = penalties[key];
  if (!p.base) p.base = { value: 0 };
  if (!p.special) p.special = { value: 0 };
  if (!p.multiplier) p.multiplier = { value: 1 };
  if (!p.final) p.final = { value: 0 };
  return p;
}

/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateAllActionsModifier = data => {
  const modifiers = data.general.modifiers;
  if (!modifiers.allActionsPenalties || typeof modifiers.allActionsPenalties !== 'object') {
    modifiers.allActionsPenalties = {};
  }
  const penalties = modifiers.allActionsPenalties;

  const fatigue = ensurePenalty(penalties, 'fatigue');
  const pain = ensurePenalty(penalties, 'pain');
  const physicalDeficiency = ensurePenalty(penalties, 'physicalDeficiency');
  const supernatural = ensurePenalty(penalties, 'supernatural');

  if (
    penalties.withstandPainMitigation === undefined ||
    penalties.withstandPainMitigation === null ||
    typeof penalties.withstandPainMitigation !== 'object'
  ) {
    penalties.withstandPainMitigation = { value: 0 };
  }

  if (!modifiers.allActions.bonus || typeof modifiers.allActions.bonus !== 'object') {
    modifiers.allActions.bonus = {
      base: { value: 0 },
      special: { value: 0 },
      final: { value: 0 }
    };
  }
  const bonus = modifiers.allActions.bonus;
  if (!bonus.base) bonus.base = { value: 0 };
  if (!bonus.special) bonus.special = { value: 0 };
  if (!bonus.final) bonus.final = { value: 0 };

  fatigue.base.value = calculateFatigue(data);
  physicalDeficiency.base.value = calculateNegativeLifePoints(data);

  fatigue.final.value = computePenaltyFinal(fatigue);
  pain.final.value = computePenaltyFinal(pain);
  physicalDeficiency.final.value = computePenaltyFinal(physicalDeficiency);
  supernatural.final.value = computePenaltyFinal(supernatural);

  const mitigation = Number(penalties.withstandPainMitigation.value) || 0;
  const mitigatedFatiguePain = applyWithstandPainMitigation(
    fatigue.final.value,
    pain.final.value,
    mitigation
  );

  bonus.final.value = (Number(bonus.base.value) || 0) + (Number(bonus.special.value) || 0);

  modifiers.allActions.base.value =
    mitigatedFatiguePain +
    physicalDeficiency.final.value +
    supernatural.final.value;

  modifiers.allActions.final.value =
    modifiers.allActions.base.value + bonus.final.value;
};

mutateAllActionsModifier.abfFlow = {
  deps: [
    'system.characteristics.secondaries.fatigue.value',
    'system.characteristics.secondaries.fatigue.max',
    'system.characteristics.secondaries.lifePoints.value',
    'system.general.modifiers.allActionsPenalties.fatigue.special.value',
    'system.general.modifiers.allActionsPenalties.fatigue.multiplier.value',
    'system.general.modifiers.allActionsPenalties.pain.base.value',
    'system.general.modifiers.allActionsPenalties.pain.special.value',
    'system.general.modifiers.allActionsPenalties.pain.multiplier.value',
    'system.general.modifiers.allActionsPenalties.physicalDeficiency.special.value',
    'system.general.modifiers.allActionsPenalties.physicalDeficiency.multiplier.value',
    'system.general.modifiers.allActionsPenalties.supernatural.base.value',
    'system.general.modifiers.allActionsPenalties.supernatural.special.value',
    'system.general.modifiers.allActionsPenalties.supernatural.multiplier.value',
    'system.general.modifiers.allActionsPenalties.withstandPainMitigation.value',
    'system.general.modifiers.allActions.bonus.base.value',
    'system.general.modifiers.allActions.bonus.special.value'
  ],
  mods: [
    'system.general.modifiers.allActionsPenalties.fatigue.base.value',
    'system.general.modifiers.allActionsPenalties.fatigue.final.value',
    'system.general.modifiers.allActionsPenalties.pain.final.value',
    'system.general.modifiers.allActionsPenalties.physicalDeficiency.base.value',
    'system.general.modifiers.allActionsPenalties.physicalDeficiency.final.value',
    'system.general.modifiers.allActionsPenalties.supernatural.final.value',
    'system.general.modifiers.allActions.bonus.final.value',
    'system.general.modifiers.allActions.base.value',
    'system.general.modifiers.allActions.final.value'
  ]
};
