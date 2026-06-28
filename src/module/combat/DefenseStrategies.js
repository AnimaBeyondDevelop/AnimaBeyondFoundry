import { FormulaEvaluator } from '../../utils/formulaEvaluator.js';
import {
  getAccumulatedDefenses,
  multipleDefensePenaltyFromAccumulated
} from './utils/defensesCounterCheck.js';

const toSafeNumber = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const RULES = {
  block: {
    stackDefense: true,
    applyMultipleDefensePenalty: true,
    flavorSuffix: c => (c.weaponName ? ` (${c.weaponName})` : '')
  },
  dodge: {
    stackDefense: true,
    applyMultipleDefensePenalty: true,
    flavorSuffix: () => ''
  },
  supernaturalShield: {
    stackDefense: false,
    applyMultipleDefensePenalty: false,
    flavorSuffix: c => (c.shieldName ? ` (${c.shieldName})` : '')
  }
};

function withRules(candidate) {
  const r = RULES[candidate.type];
  return {
    ...candidate,
    stackDefense: r.stackDefense,
    applyMultipleDefensePenalty: r.applyMultipleDefensePenalty,
    flavorSuffix: r.flavorSuffix(candidate)
  };
}

function resolveAttackWeapon(attackData) {
  const weaponId = attackData?.weaponId;
  const attackerId = attackData?.attackerId;
  if (!weaponId) return null;

  const attacker = attackerId ? game.actors.get(attackerId) : null;
  return attacker?.items?.get?.(weaponId) ?? null;
}

export function resolveProjectileType(attackData) {
  const explicit = attackData?.projectile?.type ?? attackData?.projectileType ?? '';
  if (explicit === 'shot' || explicit === 'throw') return explicit;
  if (explicit === 'projectile') return 'shot';

  const weapon = resolveAttackWeapon(attackData);
  if (weapon?.system?.isRanged?.value) {
    const shotType = weapon.system?.shotType?.value;
    if (shotType === 'shot' || shotType === 'throw') return shotType;
  }

  if (attackData?.isProjectile === true) return 'shot';

  return '';
}

export function isProjectileAttack(attackData) {
  const projectileType = resolveProjectileType(attackData);
  if (projectileType === 'shot' || projectileType === 'throw') return true;
  if (attackData?.isProjectile === true) return true;
  return !!resolveAttackWeapon(attackData)?.system?.isRanged?.value;
}

/**
 * Penalties for defending against shot or thrown projectiles.
 * Mirrors CombatDefenseDialog rules (without distance / point-blank checks).
 */
export function computeProjectileDefensePenalty({
  attackData,
  defenseType,
  hasMastery = false,
  isShieldWeapon = false
}) {
  if (defenseType === 'shield' || !isProjectileAttack(attackData)) return 0;

  const projectileType = resolveProjectileType(attackData) || 'shot';

  if (defenseType === 'dodge') {
    if (projectileType === 'throw') return 0;
    return hasMastery ? 0 : 30;
  }

  if (defenseType === 'block') {
    if (projectileType === 'throw') {
      if (hasMastery || isShieldWeapon) return 0;
      return 50;
    }

    if (isShieldWeapon) return hasMastery ? 0 : 30;
    return hasMastery ? 20 : 80;
  }

  return 0;
}

export const BlockStrategy = {
  type: 'block',
  compute(actor) {
    const weapons = actor.system?.combat?.weapons ?? [];
    const bestWeapon = weapons.reduce((best, w) => {
      const cand = Number(w?.system?.block?.final?.value ?? -Infinity);
      const cur = Number(best?.system?.block?.final?.value ?? -Infinity);
      return cand > cur ? w : best;
    }, undefined);

    const naturalBase = toSafeNumber(actor.system?.combat?.block?.base?.value ?? 0);
    const finalBase = toSafeNumber(
      (bestWeapon
        ? bestWeapon.system?.block?.final?.value
        : actor.system?.combat?.block?.final?.value) ?? 0
    );

    return withRules({
      type: 'block',
      naturalBase,
      finalBase,
      hasMastery: naturalBase >= 200,
      weaponId: bestWeapon?._id ?? '',
      weaponName: bestWeapon?.name ?? '',
      isShieldWeapon: !!bestWeapon?.system?.isShield?.value,
      shieldId: '',
      shieldName: ''
    });
  }
};

export const DodgeStrategy = {
  type: 'dodge',
  compute(actor) {
    const naturalBase = toSafeNumber(actor.system?.combat?.dodge?.base?.value ?? 0);
    const finalBase = toSafeNumber(actor.system?.combat?.dodge?.final?.value ?? 0);

    return withRules({
      type: 'dodge',
      naturalBase,
      finalBase,
      hasMastery: naturalBase >= 200,
      weaponId: '',
      weaponName: '',
      isShieldWeapon: false,
      shieldId: '',
      shieldName: ''
    });
  }
};

function resolveSupernaturalShields(actor) {
  return actor.items?.filter(i => i.type === 'supernaturalShield') ?? [];
}

export function actorHasSupernaturalShield(actor) {
  return resolveSupernaturalShields(actor).length > 0;
}

export const SupernaturalShieldStrategy = {
  type: 'supernaturalShield',
  compute(actor) {
    const shields = resolveSupernaturalShields(actor);

    let bestValue = 0;
    let bestName = '';
    let bestId = '';

    for (const s of shields) {
      const formula = String(s?.system?.abilityFormula ?? '').trim();
      if (!formula) continue;

      const v = toSafeNumber(FormulaEvaluator.evaluate(formula, actor));
      if (v > bestValue) {
        bestValue = v;
        bestName = s.name ?? '';
        bestId = s._id ?? s.id ?? '';
      }
    }

    return withRules({
      type: 'supernaturalShield',
      naturalBase: bestValue,
      finalBase: bestValue,
      hasMastery: bestValue >= 200,
      weaponId: '',
      weaponName: '',
      isShieldWeapon: false,
      shieldId: bestId,
      shieldName: bestName
    });
  }
};

function computeEffectiveScore(candidate, attackData, defensesCounter) {
  const accumulated = getAccumulatedDefenses(defensesCounter);

  const multiPenalty = candidate.applyMultipleDefensePenalty
    ? multipleDefensePenaltyFromAccumulated(accumulated)
    : 0;

  const defenseType =
    candidate.type === 'supernaturalShield' ? 'shield' : candidate.type;

  const projPenalty = computeProjectileDefensePenalty({
    attackData,
    defenseType,
    hasMastery: candidate.hasMastery,
    isShieldWeapon: candidate.isShieldWeapon
  });

  return {
    effectiveScore: (Number(candidate.finalBase) || 0) - projPenalty - multiPenalty,
    appliedPenalties: {
      projectilePenalty: projPenalty,
      multipleDefensePenalty: multiPenalty
    }
  };
}

/**
 * Pick the best defense candidate considering applied penalties (projectile + multiple defenses).
 * Tie-break: block > dodge > supernaturalShield.
 */
export function pickBestDefenseCandidate(
  actor,
  { attackData = null, defensesCounter = null } = {}
) {
  const hasSupernaturalShield = actorHasSupernaturalShield(actor);

  const candidates = [BlockStrategy.compute(actor), DodgeStrategy.compute(actor)];

  if (hasSupernaturalShield) {
    candidates.push(SupernaturalShieldStrategy.compute(actor));
  }

  const priority = { block: 0, dodge: 1, supernaturalShield: 2 };

  let best = null;

  for (const c of candidates) {
    const { effectiveScore, appliedPenalties } = computeEffectiveScore(
      c,
      attackData,
      defensesCounter
    );
    const enriched = {
      ...c,
      effectiveScore,
      appliedPenalties,
      projectilePenalty: appliedPenalties.projectilePenalty
    };

    if (!best) {
      best = enriched;
      continue;
    }

    if (enriched.effectiveScore > best.effectiveScore) {
      best = enriched;
      continue;
    }

    if (enriched.effectiveScore < best.effectiveScore) continue;

    // Tie-break on priority
    if (priority[enriched.type] < priority[best.type]) best = enriched;
  }

  return best;
}
