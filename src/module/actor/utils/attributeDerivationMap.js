// /module/actor/utils/attributeDerivationMap.js

/**
 * Mapping of every rollable attribute in the system to the list of data
 * paths that contribute to its final value. Used by the trace pipeline so
 * an AE that modifies any contributing path is attributed to the right
 * roll in the chat (e.g. Ceguera parcial penalizing physicalActions shows
 * up under Ataque, Parada, Esquiva and Acciones Físicas).
 *
 * Every entry lists the FINAL path first (the one the roll reads) and then
 * any upstream paths that flow into it through mutateCombatData or related
 * derived calculations.
 *
 * Keys here are stable identifiers used by inferAttributeFromFlavor and
 * by direct callers; they don't need to match Foundry's data paths.
 */
export const ATTRIBUTE_DERIVATION_MAP = {
  attack: [
    'system.combat.attack.final.value',
    'system.combat.attack.base.value',
    'system.combat.attack.special.value',
    'system.general.modifiers.allActions.final.value',
    'system.general.modifiers.physicalActions.final.value'
  ],
  block: [
    'system.combat.block.final.value',
    'system.combat.block.base.value',
    'system.combat.block.special.value',
    'system.general.modifiers.allActions.final.value',
    'system.general.modifiers.physicalActions.final.value'
  ],
  dodge: [
    'system.combat.dodge.final.value',
    'system.combat.dodge.base.value',
    'system.combat.dodge.special.value',
    'system.general.modifiers.allActions.final.value',
    'system.general.modifiers.physicalActions.final.value'
  ],
  initiative: [
    'system.characteristics.secondaries.initiative.final.value',
    'system.characteristics.secondaries.initiative.base.value',
    'system.general.modifiers.allActions.final.value'
  ],
  magicProjectionOffensive: [
    'system.mystic.magicProjection.imbalance.offensive.final.value',
    'system.mystic.magicProjection.imbalance.offensive.base.value',
    'system.mystic.magicProjection.final.value',
    'system.mystic.magicProjection.base.value',
    'system.general.modifiers.allActions.final.value'
  ],
  magicProjectionDefensive: [
    'system.mystic.magicProjection.imbalance.defensive.final.value',
    'system.mystic.magicProjection.imbalance.defensive.base.value',
    'system.mystic.magicProjection.final.value',
    'system.mystic.magicProjection.base.value',
    'system.general.modifiers.allActions.final.value'
  ],
  psychicProjectionOffensive: [
    'system.psychic.psychicProjection.imbalance.offensive.final.value',
    'system.psychic.psychicProjection.imbalance.offensive.base.value',
    'system.psychic.psychicProjection.final.value',
    'system.psychic.psychicProjection.base.value',
    'system.general.modifiers.allActions.final.value'
  ],
  psychicProjectionDefensive: [
    'system.psychic.psychicProjection.imbalance.defensive.final.value',
    'system.psychic.psychicProjection.imbalance.defensive.base.value',
    'system.psychic.psychicProjection.final.value',
    'system.psychic.psychicProjection.base.value',
    'system.general.modifiers.allActions.final.value'
  ],
  physicalAction: [
    'system.general.modifiers.physicalActions.final.value',
    'system.general.modifiers.physicalActions.base.value',
    'system.general.modifiers.allActions.final.value'
  ]
};

/**
 * Infer the attribute key (one of ATTRIBUTE_DERIVATION_MAP) from a roll
 * flavor string. Robust to the system's mix of Spanish and English flavor
 * texts; returns null if no confident match.
 *
 * Order matters: more specific patterns first, then generic ones.
 *
 * @param {string} flavor
 * @returns {string|null}
 */
export function inferAttributeFromFlavor(flavor) {
  if (typeof flavor !== 'string' || !flavor) return null;
  const f = flavor.toLowerCase();

  // Magic projection — offensive vs defensive
  if (f.includes('proyección mágica') || f.includes('proyeccion magica') || f.includes('magic projection')) {
    if (f.includes('defensiv')) return 'magicProjectionDefensive';
    return 'magicProjectionOffensive';
  }
  // Psychic projection — offensive vs defensive
  if (f.includes('proyección psíquica') || f.includes('proyeccion psiquica') || f.includes('psychic projection')) {
    if (f.includes('defensiv')) return 'psychicProjectionDefensive';
    return 'psychicProjectionOffensive';
  }

  if (/\bparada\b/.test(f) || /\bblock\b/.test(f)) return 'block';
  if (/\besquiva\b/.test(f) || /\bdodge\b/.test(f)) return 'dodge';
  if (/\biniciativa\b/.test(f) || /\binitiative\b/.test(f)) return 'initiative';

  // Attack catches "rolling attack" and "physicalAttack" etc.
  if (/\battack\b/.test(f) || /\bataque\b/.test(f)) return 'attack';

  return null;
}
