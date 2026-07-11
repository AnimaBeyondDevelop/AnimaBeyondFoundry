import ABFFoundryRoll from '../../../rolls/ABFFoundryRoll.js';
import { ABFAttackData } from '../../../combat/ABFAttackData.js';
import { openModDialog } from '../../../utils/dialogs/openSimpleInputDialog.js';
import { getSnapshotTargets } from '../getSnapshotTargets.js';
import { combineMassAttackDamage } from '../applyMassAttackDamage.js';
import { castPsychicDefenseShield } from '../../../psychic/utils/psychicDefenseShield.js';

function _getBestEffectKey(effects, rolledValue) {
  if (!effects) return null;

  const keys = Object.keys(effects)
    .map(k => Number(k))
    .filter(n => Number.isFinite(n))
    .sort((a, b) => a - b);

  if (keys.length === 0) return null;

  let best = keys[0];
  for (const k of keys) {
    if (k <= rolledValue) best = k;
    else break;
  }
  return String(best);
}

function _parseFatigueFromText(text) {
  const m = (text ?? '').match(/Fatiga\s*(\d+)/i);
  return m ? Number(m[1]) || 0 : 0;
}

function _getPowerCastContext(sheet, powerId) {
  if (!powerId) {
    ui.notifications?.warn('Poder psíquico no válido.');
    return null;
  }

  const actor = sheet.actor;
  const power = actor?.items?.get(powerId);
  if (!power) {
    ui.notifications?.warn('Poder psíquico no encontrado.');
    return null;
  }

  const attackerTokenDoc = sheet.token ?? actor?.getActiveTokens?.()[0];
  const token = attackerTokenDoc?.object ?? attackerTokenDoc ?? null;

  return { actor, power, token };
}

function _resolveEffectFromPotential(power, potential) {
  const effects = power.system?.effects ?? {};
  const difficultyKey = _getBestEffectKey(effects, potential);
  const effectData = difficultyKey ? effects?.[difficultyKey] : null;

  return {
    potential,
    difficultyKey,
    effectData,
    effectText: effectData?.value ?? ''
  };
}

function _resolveEffectFromDifficulty(power, difficultyKey) {
  const effects = power.system?.effects ?? {};
  const key = String(difficultyKey);
  const effectData = effects?.[key] ?? effects?.[Number(key)] ?? null;

  return {
    potential: Number(key),
    difficultyKey: key,
    effectData,
    effectText: effectData?.value ?? ''
  };
}

async function _rollPsychicPotential(actor, power) {
  const baseFinal = Number(actor.system?.psychic?.psychicPotential?.final?.value ?? 0);
  const mentalPatternImbalance = false; // TO-DO: add mentalPatterns logic
  const mod = Number(await openModDialog({ title: 'Modificador de Potencial' })) || 0;
  const roll = new ABFFoundryRoll(`1d100PsychicRoll + ${baseFinal} + ${mod}`, {
    ...actor.system,
    power,
    mentalPatternImbalance
  });

  await roll.evaluate({ async: true });

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${power.name} - Potencial`
  });

  return roll;
}

async function _sendPowerToChat({
  actor,
  token,
  power,
  difficultyKey,
  effectText,
  roll
}) {
  const speaker = token
    ? ChatMessage.getSpeaker({ actor, token })
    : ChatMessage.getSpeaker({ actor });

  const diffLabel = difficultyKey ?? '-';
  const flavor = `${power.name} (${diffLabel})`;

  const content = effectText ? `<p>${effectText}</p>` : '';

  if (roll) {
    await roll.toMessage({ speaker, flavor });
  }

  //   if (content) {
  //     await ChatMessage.create({ speaker, flavor, content });
  //   } else {
  //     ui.notifications?.warn('El poder no tiene efecto definido para ese grado.');
  //   }
}

async function _sendPsychicAttackToChat({
  actor,
  power,
  difficultyKey,
  effectData,
  baseDamage,
  targets
}) {
  const mod = Number(await openModDialog({ title: 'Modificador de Proyección' })) || 0;

  const offensiveProjection =
    actor.system?.psychic?.psychicProjection?.imbalance?.offensive;
  const hasMastery = offensiveProjection.base.value >= 200;
  const die = hasMastery ? '1d100xamastery' : '1d100xa';

  const roll = new ABFFoundryRoll(
    `${die} + ${offensiveProjection.final.value} + ${mod}`,
    actor.system
  );
  await roll.evaluate({ async: true });

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${power.name} (${difficultyKey ?? '-'})`
  });

  await ABFAttackData.builder()
    .attackAbility(roll.total)
    .damage(
      combineMassAttackDamage(actor, Number(baseDamage) || 0, 0, { supernatural: true })
    )
    .ignoreArmor(false)
    .reducedArmor(0)
    .armorType(power.system?.critic?.value ?? game.animabf.weapon.NoneWeaponCritic.NONE)
    .damageType(game.animabf.combat.DamageType.NONE)
    .presence(0)
    .isProjectile(true)
    .damagesEnergy(effectData?.affectsInmaterial?.value)
    .automaticCrit(!!actor.system.general.modifiers.automaticCrit?.value)
    .critBonus(0)
    .critDamageBonus(actor.system.general.modifiers.critDamageBonus?.final?.value ?? 0)
    .attackerId(actor.id)
    .weaponId(power.id)
    .targets(targets ?? [])
    .build()
    .toChatMessage({ actor, weapon: power });

  // if (effectText) {
  //   await ChatMessage.create({
  //     speaker: ChatMessage.getSpeaker({ actor }),
  //     flavor: `${power.name} (${difficultyKey ?? '-'})`,
  //     content: `<p>${effectText}</p>`
  //   });
  // }
}

function _getFatigueResult(effectData, effectText) {
  const structuredFatigue = Number(effectData?.fatigue?.value ?? 0) || 0;
  const parsedFatigue = _parseFatigueFromText(effectText);
  return Math.max(structuredFatigue, parsedFatigue);
}

/**
 * Applies a psychic power once potential (and its resolved effect) is known.
 */
async function _castPsychicPowerAtPotential({
  actor,
  token,
  power,
  potential,
  difficultyKey,
  effectData,
  effectText,
  roll = null
}) {
  const combatType = power.system?.combatType?.value ?? 'attack';

  if (combatType === 'defense') {
    await castPsychicDefenseShield({
      actor,
      power,
      difficultyKey,
      potential,
      effectData
    });
    await _sendPowerToChat({
      actor,
      token,
      power,
      difficultyKey,
      effectText,
      roll: null
    });
    return;
  }

  if (combatType === 'attack' && _getFatigueResult(effectData, effectText) === 0) {
    const baseDamage = Number(effectData?.damage?.value ?? 0) || 0;
    const snapshotTargets = getSnapshotTargets();

    await _sendPsychicAttackToChat({
      actor,
      power,
      difficultyKey,
      effectData,
      baseDamage,
      targets: snapshotTargets
    });
    return;
  }

  await _sendPowerToChat({ actor, token, power, difficultyKey, effectText, roll });
}

/**
 * Rolls psychic potential, then casts at the resolved grade.
 *
 * @param {Actor} actor
 * @param {object} params
 * @param {string} params.powerId
 * @param {TokenDocument | object | null} [params.token]
 */
export async function castPsychicPowerAtPotential(actor, { powerId, token }) {
  const power = actor?.items?.get(powerId);
  if (!power) {
    ui.notifications?.warn('Poder psíquico no encontrado.');
    return;
  }

  const attackerTokenDoc = token ?? actor?.getActiveTokens?.()[0];
  const resolvedToken = attackerTokenDoc?.object ?? attackerTokenDoc ?? null;

  const roll = await _rollPsychicPotential(actor, power);
  const potential = Number(roll.total ?? 0);
  const effect = _resolveEffectFromPotential(power, potential);

  await _castPsychicPowerAtPotential({
    actor,
    token: resolvedToken,
    power,
    ...effect,
    roll: null
  });
}

/**
 * Footer button: rolls psychic potential, then casts at the resolved grade.
 */
export async function castPsychicPower(sheet, event) {
  const context = _getPowerCastContext(sheet, event.currentTarget.dataset.powerId);
  if (!context) return;

  await castPsychicPowerAtPotential(context.actor, {
    powerId: context.power.id,
    token: context.token
  });
}

castPsychicPower.action = 'castPsychicPower';

/**
 * Difficulty button: casts directly at that difficulty (no roll).
 */
export async function castPsychicPowerDifficulty(sheet, event) {
  const powerId = event.currentTarget.dataset.powerId;
  const difficultyKey = event.currentTarget.dataset.difficulty;

  if (!powerId || difficultyKey == null) {
    return ui.notifications?.warn('Datos del poder/grado no válidos.');
  }

  const context = _getPowerCastContext(sheet, powerId);
  if (!context) return;

  const { actor, power, token } = context;
  const effect = _resolveEffectFromDifficulty(power, difficultyKey);

  await _castPsychicPowerAtPotential({
    actor,
    token,
    power,
    ...effect
  });
}

castPsychicPowerDifficulty.action = 'castPsychicPowerDifficulty';
