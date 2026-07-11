/**
 * Rounds a value down to the nearest multiple of `step`.
 * @param {number} value
 * @param {number} step
 */
function roundDownToStep(value, step) {
  return Math.floor(value / step) * step;
}

/**
 * @param {number} individualLife
 */
function getNormalMassParams(individualLife) {
  return {
    roundedPv: roundDownToStep(individualLife, 50),
    reducedContribution: individualLife < 250 ? 10 : 25
  };
}

/**
 * @param {number} individualLife
 */
function getAccumulationMassParams(individualLife) {
  const base = roundDownToStep(individualLife, 100);
  return {
    base,
    halfBase: base / 2,
    reducedContribution: individualLife < 1000 ? 100 : 250
  };
}

/**
 * Mass life without damage accumulation (Anima rules).
 * @param {number} individualLife
 * @param {number} memberCount
 */
function calculateNormalMassLife(individualLife, memberCount) {
  const { roundedPv, reducedContribution } = getNormalMassParams(individualLife);

  if (memberCount <= 100) {
    return memberCount * roundedPv;
  }

  return 100 * roundedPv + (memberCount - 100) * reducedContribution;
}

/**
 * Mass life with damage accumulation.
 * @param {number} individualLife
 * @param {number} memberCount
 */
function calculateAccumulationMassLife(individualLife, memberCount) {
  const { base, halfBase, reducedContribution } = getAccumulationMassParams(individualLife);

  if (memberCount <= 50) {
    return base + (memberCount - 1) * halfBase;
  }

  const firstFifty = base + 49 * halfBase;
  return firstFifty + (memberCount - 50) * reducedContribution;
}

/**
 * Inverse of {@link calculateNormalMassLife} for surviving members.
 * @param {number} individualLife
 * @param {number} currentLife
 */
function calculateNormalMassMemberCountFromLife(individualLife, currentLife) {
  const { roundedPv, reducedContribution } = getNormalMassParams(individualLife);
  if (roundedPv <= 0 || currentLife <= 0) return 0;

  const lifeAt100Members = 100 * roundedPv;
  if (currentLife <= lifeAt100Members) {
    return Math.ceil(currentLife / roundedPv);
  }

  const remainingLife = currentLife - lifeAt100Members;
  return 100 + Math.ceil(remainingLife / reducedContribution);
}

/**
 * Inverse of {@link calculateAccumulationMassLife} for surviving members.
 * @param {number} individualLife
 * @param {number} currentLife
 */
function calculateAccumulationMassMemberCountFromLife(individualLife, currentLife) {
  const { base, halfBase, reducedContribution } = getAccumulationMassParams(individualLife);
  if (base <= 0 || currentLife <= 0) return 0;

  const lifeAt50Members = base + 49 * halfBase;
  if (currentLife <= lifeAt50Members) {
    if (currentLife <= base) {
      return Math.ceil(currentLife / base);
    }

    return 1 + Math.ceil((currentLife - base) / halfBase);
  }

  const remainingLife = currentLife - lifeAt50Members;
  return 50 + Math.ceil(remainingLife / reducedContribution);
}

/**
 * Calculates total life points for an enemy mass.
 * @param {{ individualLife: number, memberCount: number, damageAccumulation?: boolean }} params
 */
export function calculateMassLifePoints({
  individualLife,
  memberCount,
  damageAccumulation = false
}) {
  const count = Math.max(0, Math.floor(Number(memberCount) || 0));
  const pv = Math.max(0, Number(individualLife) || 0);
  if (count <= 0 || pv <= 0) return 0;

  if (damageAccumulation) {
    return calculateAccumulationMassLife(pv, count);
  }

  return calculateNormalMassLife(pv, count);
}

/**
 * Estimates surviving mass members from remaining life points using the
 * inverse of the mass life rules (rounded PV and tiered contributions).
 * @param {{ individualLife: number, currentLife: number, damageAccumulation?: boolean }} params
 */
export function calculateMassMemberCountFromLife({
  individualLife,
  currentLife,
  damageAccumulation = false
}) {
  const pv = Math.max(0, Number(individualLife) || 0);
  const life = Math.max(0, Number(currentLife) || 0);
  if (pv <= 0 || life <= 0) return 0;

  if (damageAccumulation) {
    return calculateAccumulationMassMemberCountFromLife(pv, life);
  }

  return calculateNormalMassMemberCountFromLife(pv, life);
}
