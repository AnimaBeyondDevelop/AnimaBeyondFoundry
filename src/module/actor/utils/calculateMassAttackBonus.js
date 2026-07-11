/**
 * Anima Table 1: attack skill bonus by number of enemies.
 * @type {ReadonlyArray<{ minMembers: number, bonus: number }>}
 */
export const MASS_ATTACK_BONUS_TABLE = [
  { minMembers: 100, bonus: 150 },
  { minMembers: 50, bonus: 130 },
  { minMembers: 25, bonus: 110 },
  { minMembers: 15, bonus: 90 },
  { minMembers: 10, bonus: 70 },
  { minMembers: 5, bonus: 50 },
  { minMembers: 3, bonus: 30 }
];

/**
 * @param {number} memberCount
 */
export function getMassAttackBonusFromMemberCount(memberCount) {
  const count = Math.max(0, Math.floor(Number(memberCount) || 0));

  for (const row of MASS_ATTACK_BONUS_TABLE) {
    if (count >= row.minMembers) return row.bonus;
  }

  return 0;
}

/**
 * Members considered for Table 1 after splitting by target count.
 * @param {{ memberCount: number, targetCount?: number }} params
 */
export function resolveEffectiveMassMembersForAttackBonus({
  memberCount,
  targetCount = 1
}) {
  const totalMembers = Math.max(0, Math.floor(Number(memberCount) || 0));
  const targets = Math.max(1, Math.floor(Number(targetCount) || 1));

  if (totalMembers <= 0) return 0;

  return Math.ceil(totalMembers / targets);
}

/**
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 * @param {{ targetCount?: number }} [options]
 */
export function resolveMassAttackBonus(actor, { targetCount = 1 } = {}) {
  const settings = actor?.system?.general?.settings;
  const memberCount = Number(settings?.massMemberCount?.value) || 0;
  const organizedMass = !!settings?.organizedMass?.value;

  const effectiveMembers = resolveEffectiveMassMembersForAttackBonus({
    memberCount,
    targetCount
  });

  let bonus = getMassAttackBonusFromMemberCount(effectiveMembers);

  if (!organizedMass) {
    bonus = Math.floor(bonus / 2);
  }

  return bonus;
}
