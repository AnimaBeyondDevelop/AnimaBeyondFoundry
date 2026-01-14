import { FormulaEvaluator } from '../../utils/formulaEvaluator.js';

const toSafeNumber = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const RULES = {
  block: {
    stackDefense: true,
    applyMultipleDefensePenalty: true,
    projectilePenalty: c => {
      if (c.isShieldWeapon) return c.hasMastery ? 0 : 30;
      return c.hasMastery ? 20 : 80;
    },
    flavorSuffix: c => (c.weaponName ? ` (${c.weaponName})` : '')
  },
  dodge: {
    stackDefense: true,
    applyMultipleDefensePenalty: true,
    projectilePenalty: c => (c.hasMastery ? 0 : 30),
    flavorSuffix: () => ''
  },
  supernaturalShield: {
    stackDefense: false,
    applyMultipleDefensePenalty: false,
    projectilePenalty: () => 0,
    flavorSuffix: c => (c.shieldName ? ` (${c.shieldName})` : '')
  }
};

function withRules(candidate) {
  const r = RULES[candidate.type];
  return {
    ...candidate,
    stackDefense: r.stackDefense,
    applyMultipleDefensePenalty: r.applyMultipleDefensePenalty,
    projectilePenalty: r.projectilePenalty(candidate),
    flavorSuffix: r.flavorSuffix(candidate)
  };
}

function isProjectileAttack(attackData) {
  const projectileType =
    attackData?.projectile?.type ?? attackData?.projectileType ?? null;
  if (attackData?.isProjectile === true) return true;
  return (
    projectileType === 'shot' ||
    projectileType === 'throw' ||
    projectileType === 'projectile'
  );
}

function multipleDefensePenaltyFromAccumulated(accumulated) {
  const a = Math.max(0, Number(accumulated) || 0);
  if (a <= 0) return 0;
  if (a === 1) return 30;
  if (a === 2) return 50;
  if (a === 3) return 70;
  return 90;
}

function getAccumulated(defensesCounter) {
  const keep = defensesCounter?.keepAccumulating ?? true;
  const acc = defensesCounter?.accumulated ?? 0;
  return keep ? acc : 0;
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

export const SupernaturalShieldStrategy = {
  type: 'supernaturalShield',
  compute(actor) {
    const shields = actor.items?.filter(i => i.type === 'supernaturalShield') ?? [];

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
        bestId = s.id ?? '';
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
  const accumulated = getAccumulated(defensesCounter);

  const multiPenalty = candidate.applyMultipleDefensePenalty
    ? multipleDefensePenaltyFromAccumulated(accumulated)
    : 0;

  const projPenalty = isProjectileAttack(attackData)
    ? Number(candidate.projectilePenalty) || 0
    : 0;

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
  const candidates = [
    BlockStrategy.compute(actor),
    DodgeStrategy.compute(actor),
    SupernaturalShieldStrategy.compute(actor)
  ];

  const priority = { block: 0, dodge: 1, supernaturalShield: 2 };

  let best = null;

  for (const c of candidates) {
    const { effectiveScore, appliedPenalties } = computeEffectiveScore(
      c,
      attackData,
      defensesCounter
    );
    const enriched = { ...c, effectiveScore, appliedPenalties };

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
