import {
  ensureResistanceCheck,
  RESISTANCE_TYPE_ABBREVIATIONS
} from '../../types/common/resistanceCheck.js';

/**
 * Resolve a structured or free-text resistance effect for combat.
 * Supports legacy `{ value, type }`, the shared resistance-check shape, and description parsing.
 * @param {object | string | null | undefined} gradeDataOrEffect
 * @returns {{
 *   value: number,
 *   type: string | undefined,
 *   types: string[],
 *   selection: string,
 *   allowComposure: boolean,
 *   check: boolean
 * }}
 */
export const resistanceEffectCheck = gradeDataOrEffect => {
  if (typeof gradeDataOrEffect === 'object' && gradeDataOrEffect !== null) {
    const resEffect =
      gradeDataOrEffect.resistanceEffect ?? gradeDataOrEffect.resistance ?? null;

    if (resEffect && typeof resEffect === 'object') {
      const ensured = ensureResistanceCheck(resEffect, {
        scalable: !!resEffect.scale
      });
      if (ensured.types.length > 0) {
        const value =
          typeof ensured.value === 'number' ? ensured.value : Number(ensured.value) || 0;
        return {
          value,
          type: ensured.types[0],
          types: [...ensured.types],
          selection: ensured.selection,
          application: ensured.application,
          allowComposure: ensured.allowComposure,
          check: value > 0 || ensured.types.length > 0
        };
      }
    }

    if (gradeDataOrEffect.description?.value) {
      return parseDescriptionForResistance(gradeDataOrEffect.description.value);
    }
  }

  if (typeof gradeDataOrEffect === 'string') {
    return parseDescriptionForResistance(gradeDataOrEffect);
  }

  return {
    value: 0,
    type: undefined,
    types: [],
    selection: 'highest',
    application: 'onHit',
    allowComposure: false,
    check: false
  };
};

/**
 * @param {string} effect
 */
function parseDescriptionForResistance(effect) {
  const resistanceEffect = {
    value: 0,
    type: undefined,
    types: [],
    selection: 'highest',
    application: 'onHit',
    allowComposure: false,
    check: false
  };

  function updateResistanceEffect(type, regExp) {
    resistanceEffect.check = true;
    resistanceEffect.type = type;
    resistanceEffect.types = [type];
    resistanceEffect.value = parseInt(effect.match(regExp)[0].match(/\d+/)[0], 10) ?? 0;
  }

  for (const key of Object.keys(RESISTANCE_TYPE_ABBREVIATIONS)) {
    if (resistanceEffect.check) break;
    const abbr = RESISTANCE_TYPE_ABBREVIATIONS[key];
    const beforeResistance = new RegExp(`\\d+ *[RFEVMP]{0,2} *o* *${abbr}`, 'i');
    const afterResistance = new RegExp(`${abbr} *o* *[RFEVMP]{0,2} *\\d+`, 'i');

    if (beforeResistance.test(effect)) {
      updateResistanceEffect(key, beforeResistance);
    } else if (afterResistance.test(effect)) {
      updateResistanceEffect(key, afterResistance);
    }
  }

  return resistanceEffect;
}
