import { ABFDefenseData } from './ABFDefenseData.js';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll.js';
import { computeCombatResult } from './computeCombatResult.js';
import { pickBestDefenseCandidate } from './DefenseStrategies.js';

function toSafeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
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

function getDefensesCounter(actor) {
  return (
    actor?.getFlag?.(game.animabf.id, 'defensesCounter') ?? {
      accumulated: 0,
      keepAccumulating: true
    }
  );
}

export async function autoRollDefenseAgainstAttack({
  defenderToken = null,
  defenderActor = null,
  attackData,
  defenseMod = 0
}) {
  const actor = defenderActor ?? defenderToken?.actor ?? null;
  if (!actor) throw new Error('autoRollDefenseAgainstAttack: defender actor missing');

  const defensesCounter = getDefensesCounter(actor);

  const candidate = pickBestDefenseCandidate(actor, { attackData, defensesCounter });
  if (!candidate)
    throw new Error('autoRollDefenseAgainstAttack: no defense candidates available');

  const safeMod = toSafeNumber(defenseMod);

  const accumulated = defensesCounter.keepAccumulating ? defensesCounter.accumulated : 0;

  const multipleDefensePenalty = candidate.applyMultipleDefensePenalty
    ? multipleDefensePenaltyFromAccumulated(accumulated)
    : 0;

  const projectilePenalty = isProjectileAttack(attackData)
    ? candidate.projectilePenalty
    : 0;

  const die =
    candidate.naturalBase >= 200
      ? actor.system?.general?.diceSettings?.abilityMasteryDie?.value ?? '1d100xa'
      : actor.system?.general?.diceSettings?.abilityDie?.value ?? '1d100xa';

  const formula = `${die} + ${candidate.finalBase} + ${safeMod} - ${projectilePenalty} - ${multipleDefensePenalty}`;

  const roll = new ABFFoundryRoll(formula, actor.system);
  await roll.evaluate({ async: true });

  const rollMode =
    game.settings?.get?.('core', 'rollMode') ?? CONST.DICE_ROLL_MODES.PUBLIC;

  const flavorKey =
    candidate.type === 'block'
      ? 'chat.defense.autoRollFlavor.block'
      : candidate.type === 'dodge'
      ? 'chat.defense.autoRollFlavor.dodge'
      : 'chat.defense.autoRollFlavor.supernaturalShield';

  let flavor = game.i18n?.localize?.(flavorKey) || `Auto Defense — ${candidate.type}`;
  flavor = `${flavor}${candidate.flavorSuffix ?? ''}`;

  const tokenName = defenderToken?.name ?? defenderToken?.document?.name ?? actor.name;
  const speaker = defenderToken
    ? { ...ChatMessage.getSpeaker({ token: defenderToken }), alias: tokenName }
    : ChatMessage.getSpeaker({ actor });

  await roll.toMessage({ speaker, flavor, rollMode });

  if (typeof actor.accumulateDefenses === 'function') {
    actor.accumulateDefenses(!!candidate.stackDefense);
  }

  const armorType = attackData?.armorType;
  const taFinal =
    armorType != null ? actor.system?.combat?.totalArmor?.at?.[armorType]?.value ?? 0 : 0;

  // IMPORTANT: normalize supernatural shield -> "shield" so central resolution works everywhere
  const defenseTypeNormalized =
    candidate.type === 'supernaturalShield' ? 'shield' : candidate.type;

  const defenseData = ABFDefenseData.builder()
    .defenseAbility(roll.total)
    .armor(taFinal)
    .inmodifiableArmor(false)
    .defenseType(defenseTypeNormalized)
    .defenderId(actor.id)
    .defenderTokenId(defenderToken?.id ?? '')
    .weaponId(candidate.weaponId ?? '')
    .shieldId(candidate.shieldId ?? '') // IMPORTANT: needed to apply wear
    .stackDefense(candidate.stackDefense)
    .applyMultipleDefensePenalty(candidate.applyMultipleDefensePenalty)
    .projectilePenalty(projectilePenalty)
    .build();

  const combatResult = computeCombatResult(attackData, defenseData);

  return {
    actor,
    token: defenderToken ?? null,
    defenseType: defenseTypeNormalized,
    defenseTotal: roll.total,
    weaponId: candidate.weaponId ?? '',
    shieldId: candidate.shieldId ?? '',
    defenseData,
    combatResult,
    appliedPenalties: {
      projectilePenalty,
      multipleDefensePenalty
    }
  };
}
