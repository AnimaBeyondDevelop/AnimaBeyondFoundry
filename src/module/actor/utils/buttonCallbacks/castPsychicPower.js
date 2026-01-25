import ABFFoundryRoll from '../../../rolls/ABFFoundryRoll.js';
import { ABFAttackData } from '../../../combat/ABFAttackData.js';
import { ABFSupernaturalShieldData } from '../../../combat/ABFSupernaturalShieldData.js';
import { shieldValueCheck } from '../../../combat/utils/shieldValueCheck.js';
import { openModDialog } from '../../../utils/dialogs/openSimpleInputDialog.js';
import { getSnapshotTargets } from '../getSnapshotTargets.js';

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

  // Send roll to chat (Potential roll)
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
  // Quick attack like spells: ask mod, roll offensive projection, post roll, then attack data to chat
  const mod = Number(await openModDialog({ title: 'Modificador de Proyección' })) || 0;

  const offensiveProjectionBase = Number(
    actor.system?.psychic?.psychicProjection?.imbalance?.offensive?.base?.value ?? 0
  );

  const die = offensiveProjectionBase >= 200 ? '1d100xamastery' : '1d100xa';
  const roll = new ABFFoundryRoll(
    `${die} + ${offensiveProjectionBase} + ${mod}`,
    actor.system
  );
  await roll.evaluate({ async: true });

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${power.name} (${difficultyKey ?? '-'})`
  });

  await ABFAttackData.builder()
    .attackAbility(roll.total)
    .damage(Number(baseDamage) || 0)
    .ignoreArmor(false)
    .reducedArmor(0)
    .armorType(power.system?.critic?.value ?? game.animabf.weapon.NoneWeaponCritic.NONE)
    .damageType(game.animabf.combat.DamageType.NONE)
    .presence(0)
    .isProjectile(true)
    .damagesEnergy(effectData?.affectsInmaterial?.value)
    .automaticCrit(false)
    .critBonus(0)
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

/**
 * Footer button:
 * - rolls psychic potential
 * - chooses best effect key
 * - if defense -> creates supernatural shield
 * - if attack and NO fatigue result -> launches an attack like castSpellGrade quick attack
 * - otherwise -> just sends roll + effect text to chat
 */
export async function castPsychicPower(sheet, event) {
  const powerId = event.currentTarget.dataset.powerId;
  if (!powerId) return ui.notifications?.warn('Poder psíquico no válido.');

  const actor = sheet.actor;
  const power = actor?.items?.get(powerId);
  if (!power) return ui.notifications?.warn('Poder psíquico no encontrado.');

  const attackerTokenDoc = sheet.token ?? actor?.getActiveTokens?.()[0];
  const token = attackerTokenDoc?.object ?? attackerTokenDoc ?? null;

  const roll = await _rollPsychicPotential(actor, power);
  const rolledValue = Number(roll.total ?? 0);

  const effects = power.system?.effects ?? {};
  const difficultyKey = _getBestEffectKey(effects, rolledValue);

  const effectData = difficultyKey ? effects?.[difficultyKey] : null;
  const effectText = effectData?.value ?? '';

  const combatType = power.system?.combatType?.value ?? 'attack'; // 'attack' | 'defense'

  // ---------- DEFENSE: create shield ----------
  if (combatType === 'defense') {
    const shieldPoints = Number(shieldValueCheck(effectData?.shieldPoints) ?? 0) || 0;

    const defaultAbilityFormula =
      '@psychic.psychicProjection.imbalance.defensive.base.value';

    const shieldData = ABFSupernaturalShieldData.builder()
      .name(`${power.name} (${difficultyKey ?? rolledValue})`)
      .shieldPoints(shieldPoints)
      .abilityFormula(defaultAbilityFormula)
      .flags({ animabf: { supernaturalShield: { type: 'psychic' } } })
      .build();

    await actor.newSupernaturalShield(shieldData);
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

  // ---------- ATTACK: if NO fatigue result -> quick attack like spells ----------
  if (combatType === 'attack') {
    const structuredFatigue = Number(effectData?.fatigue?.value ?? 0) || 0;
    const parsedFatigue = _parseFatigueFromText(effectText);
    const fatigueResult = Math.max(structuredFatigue, parsedFatigue);

    if (fatigueResult === 0) {
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
  }

  // Fallback: default behavior (roll + effect)
  await _sendPowerToChat({ actor, token, power, difficultyKey, effectText, roll });
}

castPsychicPower.action = 'castPsychicPower';

/**
 * Difficulty button:
 * - casts directly at that difficulty (no roll)
 * - if defense -> creates shield
 * - if attack and NO fatigue result -> quick attack like spells (uses that difficulty directly)
 */
export async function castPsychicPowerDifficulty(sheet, event) {
  const powerId = event.currentTarget.dataset.powerId;
  const difficultyKey = event.currentTarget.dataset.difficulty;

  if (!powerId || difficultyKey == null) {
    return ui.notifications?.warn('Datos del poder/grado no válidos.');
  }

  const actor = sheet.actor;
  const power = actor?.items?.get(powerId);
  if (!power) return ui.notifications?.warn('Poder psíquico no encontrado.');

  const attackerTokenDoc = sheet.token ?? actor?.getActiveTokens?.()[0];
  const token = attackerTokenDoc?.object ?? attackerTokenDoc ?? null;

  const effects = power.system?.effects ?? {};
  const effectData = effects?.[difficultyKey] ?? effects?.[String(difficultyKey)] ?? null;
  const effectText = effectData?.value ?? '';

  const combatType = power.system?.combatType?.value ?? 'attack';

  if (combatType === 'defense') {
    const shieldPoints = Number(shieldValueCheck(effectData?.shieldPoints) ?? 0) || 0;
    const defaultAbilityFormula =
      '@psychic.psychicProjection.imbalance.defensive.base.value';

    const shieldData = ABFSupernaturalShieldData.builder()
      .name(`${power.name} (${difficultyKey})`)
      .shieldPoints(shieldPoints)
      .abilityFormula(defaultAbilityFormula)
      .flags({ animabf: { supernaturalShield: { type: 'psychic' } } })
      .build();

    await actor.newSupernaturalShield(shieldData);
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

  if (combatType === 'attack') {
    const structuredFatigue = Number(effectData?.fatigue?.value ?? 0) || 0;
    const parsedFatigue = _parseFatigueFromText(effectText);
    const fatigueResult = Math.max(structuredFatigue, parsedFatigue);

    if (fatigueResult === 0) {
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
  }

  await _sendPowerToChat({ actor, token, power, difficultyKey, effectText, roll: null });
}

castPsychicPowerDifficulty.action = 'castPsychicPowerDifficulty';
