import { ABFAttackData } from './ABFAttackData.js';
import { ABFDefenseData } from './ABFDefenseData.js';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll.js';
import { computeCombatResult } from './computeCombatResult.js';
import {
  computeProjectileDefensePenalty,
  pickBestDefenseCandidate
} from './DefenseStrategies.js';
import {
  getAccumulatedDefenses,
  multipleDefensePenaltyFromAccumulated
} from './utils/defensesCounterCheck.js';

function toSafeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeAttackData(attackData) {
  if (!attackData) return new ABFAttackData();
  if (attackData instanceof ABFAttackData) return attackData;
  return ABFAttackData.fromJSON(attackData);
}

function getDefensesCounter(actor) {
  return (
    actor?.getFlag?.(game.animabf.id, 'defensesCounter') ?? {
      accumulated: 0,
      keepAccumulating: true
    }
  );
}

function resolveDefenseTypeForPenalty(candidate) {
  return candidate.type === 'supernaturalShield' ? 'shield' : candidate.type;
}

function buildZeroDefenseResult({ actor, defenderToken, attackData }) {
  const armorType = attackData?.armorType;
  const taFinal =
    armorType != null ? actor.system?.combat?.totalArmor?.at?.[armorType]?.value ?? 0 : 0;

  const defenseData = ABFDefenseData.builder()
    .defenseAbility(0)
    .armor(taFinal)
    .inmodifiableArmor(false)
    .defenseType('resistance')
    .defenderId(actor.id)
    .defenderTokenId(defenderToken?.id ?? '')
    .weaponId('')
    .shieldId('')
    .stackDefense(false)
    .applyMultipleDefensePenalty(false)
    .projectilePenalty(0)
    .build();

  const combatResult = computeCombatResult(attackData, defenseData);

  return {
    actor,
    token: defenderToken ?? null,
    defenseType: 'resistance',
    defenseTotal: 0,
    weaponId: '',
    shieldId: '',
    defenseData,
    combatResult,
    appliedPenalties: {
      projectilePenalty: 0,
      multipleDefensePenalty: 0
    }
  };
}

export async function autoRollDefenseAgainstAttack({
  defenderToken = null,
  defenderActor = null,
  attackData,
  defenseMod = 0
}) {
  const actor = defenderActor ?? defenderToken?.actor ?? null;
  if (!actor) throw new Error('autoRollDefenseAgainstAttack: defender actor missing');

  attackData = normalizeAttackData(attackData);

  const defenseMode = actor.system?.general?.settings?.defenseType?.value;

  // Accumulation/resistance defenders: base defense 0, no roll, no penalties.
  if (defenseMode === 'resistance') {
    return buildZeroDefenseResult({ actor, defenderToken, attackData });
  }

  const defensesCounter = getDefensesCounter(actor);

  const candidate = pickBestDefenseCandidate(actor, { attackData, defensesCounter });
  if (!candidate)
    throw new Error('autoRollDefenseAgainstAttack: no defense candidates available');

  const safeMod = toSafeNumber(defenseMod);
  const accumulated = getAccumulatedDefenses(defensesCounter);

  const multipleDefensePenalty = candidate.applyMultipleDefensePenalty
    ? multipleDefensePenaltyFromAccumulated(accumulated)
    : 0;

  const defenseTypeForPenalty = resolveDefenseTypeForPenalty(candidate);
  const projectilePenalty = computeProjectileDefensePenalty({
    attackData,
    defenseType: defenseTypeForPenalty,
    hasMastery: !!candidate.hasMastery,
    isShieldWeapon: defenseTypeForPenalty === 'block' && !!candidate.isShieldWeapon
  });

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

  if (candidate.stackDefense && typeof actor.accumulateDefenses === 'function') {
    actor.accumulateDefenses(defensesCounter.keepAccumulating ?? true);
  }

  const armorType = attackData?.armorType;
  const taFinal =
    armorType != null ? actor.system?.combat?.totalArmor?.at?.[armorType]?.value ?? 0 : 0;

  // IMPORTANT: normalize supernatural shield -> "shield" so central resolution works everywhere
  const defenseTypeNormalized =
    candidate.type === 'supernaturalShield' ? 'shield' : candidate.type;

  const effectiveDefenseTotal = Math.max(0, toSafeNumber(roll.total));

  const defenseData = ABFDefenseData.builder()
    .defenseAbility(effectiveDefenseTotal)
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
    defenseTotal: effectiveDefenseTotal,
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
