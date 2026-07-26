/** @typedef {import('./Migration').Migration} Migration */

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function ensurePenalty(penalties, key, multiplierDefault = 1) {
  if (!penalties[key] || typeof penalties[key] !== 'object') {
    penalties[key] = {};
  }
  const p = penalties[key];
  if (!p.base || typeof p.base !== 'object') p.base = { value: 0 };
  if (!p.special || typeof p.special !== 'object') p.special = { value: 0 };
  if (!p.multiplier || typeof p.multiplier !== 'object') {
    p.multiplier = { value: multiplierDefault };
  }
  if (!p.final || typeof p.final !== 'object') p.final = { value: 0 };
  return p;
}

/** @type Migration */
export const Migration23AllActionsPenalties = {
  id: 'migration_all-actions-penalties',
  version: '2.2.4',
  order: 10,
  title: 'All-actions penalty breakdown',
  description:
    'Splits the all-actions modifier into fatigue, pain, physical deficiency and ' +
    'supernatural penalties (each with base/special/multiplier), moves former ' +
    'manual allActions.base/special into allActions.bonus.special, and relocates ' +
    'fatigue / negative-LP multipliers from automationOptions.',

  filterActors(actor) {
    const system = actor.system ?? {};
    const automation = system.automationOptions ?? {};
    const allActions = system.general?.modifiers?.allActions;
    const hasLegacyMultipliers =
      automation.calculateFatigueModifier !== undefined ||
      automation.negativeLifePointsModifier !== undefined;
    const hasLegacyAllActionsSpecial = allActions?.special !== undefined;
    const missingPenalties = !system.general?.modifiers?.allActionsPenalties;
    const missingBonus = !allActions?.bonus;
    const hasLegacySaveOption =
      automation.saveWithstandPainMitigationOnRoll !== undefined;
    return (
      hasLegacyMultipliers ||
      hasLegacyAllActionsSpecial ||
      missingPenalties ||
      missingBonus ||
      hasLegacySaveOption
    );
  },

  async updateActor(actor) {
    const system = actor.system;
    if (!system.general) system.general = {};
    if (!system.general.modifiers) system.general.modifiers = {};
    const modifiers = system.general.modifiers;

    if (!modifiers.allActions || typeof modifiers.allActions !== 'object') {
      modifiers.allActions = {};
    }
    const allActions = modifiers.allActions;

    const oldBase = num(allActions.base?.value);
    const oldSpecial = num(allActions.special?.value);

    if (!allActions.bonus || typeof allActions.bonus !== 'object') {
      allActions.bonus = {
        base: { value: 0 },
        special: { value: 0 },
        final: { value: 0 }
      };
    }
    if (!allActions.bonus.base) allActions.bonus.base = { value: 0 };
    if (!allActions.bonus.special) allActions.bonus.special = { value: 0 };
    if (!allActions.bonus.final) allActions.bonus.final = { value: 0 };

    // Only fold legacy values once (when special still exists on allActions).
    if (allActions.special !== undefined) {
      allActions.bonus.special.value =
        num(allActions.bonus.special.value) + oldBase + oldSpecial;
      delete allActions.special;
      if (!allActions.base) allActions.base = { value: 0 };
      else allActions.base.value = 0;
    }

    if (
      !modifiers.allActionsPenalties ||
      typeof modifiers.allActionsPenalties !== 'object'
    ) {
      modifiers.allActionsPenalties = {};
    }
    const penalties = modifiers.allActionsPenalties;

    const automation = system.automationOptions ?? {};
    const fatigueMult =
      automation.calculateFatigueModifier?.value === undefined ||
      automation.calculateFatigueModifier?.value === null
        ? 1
        : num(automation.calculateFatigueModifier.value);
    const physicalMult =
      automation.negativeLifePointsModifier?.value === undefined ||
      automation.negativeLifePointsModifier?.value === null
        ? 1
        : num(automation.negativeLifePointsModifier.value);

    const fatigue = ensurePenalty(penalties, 'fatigue', 1);
    const physicalDeficiency = ensurePenalty(penalties, 'physicalDeficiency', 1);
    ensurePenalty(penalties, 'pain', 1);
    ensurePenalty(penalties, 'supernatural', 1);

    if (automation.calculateFatigueModifier !== undefined) {
      fatigue.multiplier.value = fatigueMult;
    }
    if (automation.negativeLifePointsModifier !== undefined) {
      physicalDeficiency.multiplier.value = physicalMult;
    }

    if (
      penalties.withstandPainMitigation === undefined ||
      penalties.withstandPainMitigation === null ||
      typeof penalties.withstandPainMitigation !== 'object'
    ) {
      penalties.withstandPainMitigation = { value: 0 };
    }

    if (!system.automationOptions || typeof system.automationOptions !== 'object') {
      system.automationOptions = {};
    }
    delete system.automationOptions.calculateFatigueModifier;
    delete system.automationOptions.negativeLifePointsModifier;
    delete system.automationOptions.saveWithstandPainMitigationOnRoll;

    return actor;
  }
};
