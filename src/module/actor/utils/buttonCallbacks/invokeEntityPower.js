import ABFFoundryRoll from '../../../rolls/ABFFoundryRoll.js';
import { ABFAttackData } from '../../../combat/ABFAttackData.js';
import { ABFSupernaturalShieldData } from '../../../combat/ABFSupernaturalShieldData.js';
import { Templates } from '../../../utils/constants.js';
import { openModDialog } from '../../../utils/dialogs/openSimpleInputDialog.js';
import { ABFItems } from '../../../items/ABFItems.js';
import {
  DEFAULT_ENTITY_POWER_RITUAL_TIME,
  ENTITY_POWER_RITUAL_TIMES
} from '../../../types/mystic/entityPowerRitualTimes.js';
import { EntityPowerTypes } from '../../../types/mystic/EntityPowerItemConfig.js';
import { resolveEntityPowerScaledStats, formatScalableStatBreakdown } from '../../../types/mystic/entityPowerScale.js';
import {
  RESISTANCE_TYPE_ABBREVIATIONS,
  ResistanceSelectionModes,
  resolveResistanceCheck
} from '../../../types/common/resistanceCheck.js';
import { getSnapshotTargets } from '../getSnapshotTargets.js';
import { combineMassAttackDamage } from '../applyMassAttackDamage.js';

/**
 * @param {import('../../../actor/ABFActor').ABFActor} actor
 * @param {string} invocationId
 * @param {string} entityPowerId
 */
function getEntityPower(actor, invocationId, entityPowerId) {
  const invocation = actor.getInnerItem(ABFItems.INVOCATION, invocationId);
  if (!invocation) {
    ui.notifications?.warn(
      game.i18n.localize('anima.ui.mystic.entityPower.invoke.missingInvocation')
    );
    return null;
  }

  const power =
    actor.items.get(entityPowerId) ??
    actor.getInnerItem(ABFItems.ENTITY_POWER, entityPowerId);

  if (
    !power ||
    power.type !== ABFItems.ENTITY_POWER ||
    power.system?.invocationId?.value !== invocationId
  ) {
    ui.notifications?.warn(
      game.i18n.localize('anima.ui.mystic.entityPower.invoke.missingPower')
    );
    return null;
  }

  return { invocation, power };
}

/**
 * @returns {Promise<{ mod: number, ritualModifier: number, cancelled: boolean }>}
 */
async function openInvokeEntityPowerDialog() {
  const { i18n } = game;
  const content = await (
    foundry.applications?.handlebars?.renderTemplate ?? renderTemplate
  )(Templates.Dialog.InvokeEntityPowerDialog, {
    ritualTimes: ENTITY_POWER_RITUAL_TIMES,
    defaultRitualTime: DEFAULT_ENTITY_POWER_RITUAL_TIME
  });

  return new Promise(resolve => {
    new Dialog(
      {
        title: i18n.localize('dialogs.invokeEntityPower.title'),
        content,
        buttons: {
          ok: {
            label: i18n.localize('dialogs.continue'),
            callback: html => {
              const form = html.find('form')[0];
              const data = new FormDataExtended(form, {}).object;
              const ritualKey = String(
                data.ritualTime ?? DEFAULT_ENTITY_POWER_RITUAL_TIME
              );
              const ritualModifier = Number(
                ENTITY_POWER_RITUAL_TIMES[ritualKey]?.modifier ?? 0
              );
              resolve({
                mod: Number(data.mod ?? 0) || 0,
                ritualModifier,
                cancelled: false
              });
            }
          },
          cancel: {
            label: i18n.localize('dialogs.cancel'),
            callback: () => resolve({ mod: 0, ritualModifier: 0, cancelled: true })
          }
        },
        default: 'ok'
      },
      { classes: ['dialog', 'animabf-dialog', 'invoke-entity-power-dialog'], width: 420 }
    ).render(true);
  });
}

/**
 * Build HTML listing scaled stats relevant to the power type.
 * Attack combat stats use data-requires-permission="owner" (visible to owner + GM).
 * @param {object} power
 * @param {number} margin
 * @returns {string}
 */
function buildScaledStatsContent(power, margin) {
  const { i18n } = game;
  const system = power.system ?? {};
  const scaled = resolveEntityPowerScaledStats(system, margin);
  const powerType = system.powerType?.value ?? '';
  const fmt = key => formatScalableStatBreakdown(system[key], margin);
  const isAttack = powerType === 'attack' || powerType === '';

  /** @type {{ label: string, value: string | number, ownerOnly?: boolean }[]} */
  const rows = [];

  if (isAttack) {
    rows.push({
      label: i18n.localize('anima.ui.mystic.entityPower.attackAbility.title'),
      value: fmt('attackAbility'),
      ownerOnly: true
    });
    rows.push({
      label: i18n.localize('anima.ui.mystic.spell.grade.damage.title'),
      value: fmt('damage'),
      ownerOnly: true
    });
    if (system.isArea?.value) {
      rows.push({
        label: i18n.localize('anima.ui.mystic.spell.grade.area.title'),
        value: fmt('area'),
        ownerOnly: true
      });
    }
    if (scaled.reducedArmor) {
      rows.push({
        label: i18n.localize('anima.ui.combat.weapons.reducedArmor.final.title'),
        value: fmt('reducedArmor'),
        ownerOnly: true
      });
    }
    if (system.ignoreArmor?.value) {
      rows.push({
        label: i18n.localize('anima.ui.combat.weapons.ignoreArmor.title'),
        value: i18n.localize('chat.combatResult.yes'),
        ownerOnly: true
      });
    }
    const critic = system.critic?.value;
    if (critic && critic !== game.animabf.weapon.NoneWeaponCritic.NONE) {
      rows.push({
        label: i18n.localize('anima.ui.mystic.spell.critic.title'),
        value: i18n.localize(`anima.ui.combat.armors.at.${critic}.title`),
        ownerOnly: true
      });
    }
    if (scaled.critBonus) {
      rows.push({
        label: i18n.localize('macros.combat.dialog.critBonus.title'),
        value: fmt('critBonus'),
        ownerOnly: true
      });
    }
  }

  if (powerType === 'defense') {
    rows.push({
      label: i18n.localize('anima.ui.mystic.entityPower.defenseAbility.title'),
      value: fmt('defenseAbility')
    });
    rows.push({
      label: i18n.localize('anima.ui.mystic.spell.grade.shieldPoints.title'),
      value: fmt('shieldPoints')
    });
  }

  if (powerType === 'effect') {
    // Effect powers may still define numeric combat fields; show non-zero scaled ones.
    for (const [key, labelKey, ownerOnly] of [
      ['attackAbility', 'anima.ui.mystic.entityPower.attackAbility.title', true],
      ['defenseAbility', 'anima.ui.mystic.entityPower.defenseAbility.title', false],
      ['damage', 'anima.ui.mystic.spell.grade.damage.title', true],
      ['area', 'anima.ui.mystic.spell.grade.area.title', true],
      ['shieldPoints', 'anima.ui.mystic.spell.grade.shieldPoints.title', false],
      ['reducedArmor', 'anima.ui.combat.weapons.reducedArmor.final.title', true],
      ['critBonus', 'macros.combat.dialog.critBonus.title', true]
    ]) {
      if (scaled[key]) {
        rows.push({
          label: i18n.localize(labelKey),
          value: fmt(key),
          ownerOnly
        });
      }
    }
  }

  const resistance = resolveResistanceCheck(system.resistance, margin);
  if (resistance.active) {
    const typeLabels = resistance.types
      .map(key => {
        const abbr = RESISTANCE_TYPE_ABBREVIATIONS[key];
        const name = i18n.localize(`anima.ui.resistances.${key}`);
        return abbr ? `${name} (${abbr})` : name;
      })
      .join(' / ');
    const selectionNote =
      resistance.types.length > 1
        ? ` (${i18n.localize(
            resistance.selection === ResistanceSelectionModes.LOWEST
              ? 'anima.ui.resistanceCheck.selection.lowest.title'
              : 'anima.ui.resistanceCheck.selection.highest.title'
          )})`
        : '';
    const difficultyDisplay = system.resistance?.scale
      ? formatScalableStatBreakdown(system.resistance, margin)
      : String(resistance.difficulty);
    rows.push({
      label: i18n.localize('anima.ui.resistanceCheck.difficulty.title'),
      value: `${difficultyDisplay} — ${typeLabels}${selectionNote}`
    });
    rows.push({
      label: i18n.localize('anima.ui.resistanceCheck.application.title'),
      value: i18n.localize(
        `anima.ui.resistanceCheck.application.${resistance.application}.title`
      )
    });
    if (resistance.allowComposure) {
      rows.push({
        label: i18n.localize('anima.ui.resistanceCheck.allowComposure.title'),
        value: i18n.localize('anima.ui.resistanceCheck.allowComposure.yes')
      });
    }
  }

  if (!rows.length) return '';

  const list = rows
    .map(row => {
      const permAttr = row.ownerOnly ? ' data-requires-permission="owner"' : '';
      return `<li${permAttr}><strong>${row.label}:</strong> ${row.value}</li>`;
    })
    .join('');

  const content = `<p><strong>${i18n.localize(
    'anima.ui.mystic.entityPower.invoke.margin'
  )}:</strong> ${margin}</p><ul>${list}</ul>`;

  // Hide the whole attack breakdown from non-owners (same as attack chat cards).
  if (isAttack) {
    return `<div data-requires-permission="owner">${content}</div>`;
  }

  return content;
}

/**
 * Minimal item-like proxy so attack chat can render without a real Foundry Item.
 * @param {object} power
 */
function buildEntityPowerWeaponProxy(power) {
  return {
    _id: power._id,
    id: power._id,
    name: power.name,
    system: {}
  };
}

/**
 * Roll the entity's attack ability and post ABFAttackData to chat.
 * @param {import('../../../actor/ABFActor').ABFActor} actor
 * @param {object} power
 * @param {Record<string, number>} scaled
 */
async function sendEntityPowerAttack(actor, power, scaled) {
  const attackAbility = Number(scaled.attackAbility) || 0;
  const die =
    attackAbility >= 200
      ? actor.system.general.diceSettings.abilityMasteryDie.value
      : actor.system.general.diceSettings.abilityDie.value;

  const roll = new ABFFoundryRoll(`${die} + ${attackAbility}`, actor.system);
  await roll.evaluate({ async: true });

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: power.name
  });

  const isArea = !!power.system?.isArea?.value;
  const area = Number(scaled.area) || 0;
  const weaponProxy = buildEntityPowerWeaponProxy(power);

  await ABFAttackData.builder()
    .attackAbility(roll.total)
    .damage(
      combineMassAttackDamage(actor, Number(scaled.damage) || 0, 0, {
        supernatural: true
      })
    )
    .ignoreArmor(!!power.system?.ignoreArmor?.value)
    .reducedArmor(Number(scaled.reducedArmor) || 0)
    .armorType(
      power.system?.critic?.value ?? game.animabf.weapon.NoneWeaponCritic.NONE
    )
    .damageType(game.animabf.combat.DamageType.NONE)
    .presence(0)
    .isProjectile(true)
    .isArea(isArea)
    .areaDesc(isArea && area ? String(area) : '')
    .automaticCrit(
      !!power.system?.automaticCrit?.value ||
        !!actor.system.general.modifiers.automaticCrit?.value
    )
    .critBonus(
      (Number(scaled.critBonus) || 0) +
        Number(actor.system.general.modifiers.critDamageBonus?.final?.value ?? 0)
    )
    .critDamageBonus(0)
    .attackerId(actor.id)
    .weaponId(power._id)
    .targets(getSnapshotTargets())
    .build()
    .toChatMessage({ actor, weapon: weaponProxy });
}

/**
 * Create a supernatural shield when the power defines shield life points.
 * @param {import('../../../actor/ABFActor').ABFActor} actor
 * @param {object} power
 * @param {Record<string, number>} scaled
 * @returns {Promise<boolean>} whether a shield was created
 */
async function castEntityPowerDefenseShield(actor, power, scaled) {
  const shieldPoints = Number(scaled.shieldPoints) || 0;
  if (shieldPoints <= 0) return false;

  const defenseAbility = Number(scaled.defenseAbility) || 0;
  const shieldName = power.name;

  await actor.newSupernaturalShield(
    ABFSupernaturalShieldData.builder()
      .name(shieldName)
      .shieldPoints(shieldPoints)
      .abilityFormula(String(defenseAbility))
      .flags({ animabf: { supernaturalShield: { type: 'mystic' } } })
      .build()
  );

  ui.notifications?.info(
    game.i18n.format('anima.ui.combat.supernaturalShields.addedNotification', {
      name: shieldName
    })
  );

  return true;
}

/**
 * After a successful summon, apply attack/defense side effects from the power type.
 * @param {import('../../../actor/ABFActor').ABFActor} actor
 * @param {object} power
 * @param {number} margin
 */
async function applyEntityPowerSuccessEffects(actor, power, margin) {
  const system = power.system ?? {};
  const powerType = system.powerType?.value ?? EntityPowerTypes.ATTACK;
  const scaled = resolveEntityPowerScaledStats(system, margin);

  if (powerType === EntityPowerTypes.ATTACK) {
    await sendEntityPowerAttack(actor, power, scaled);
    return;
  }

  if (powerType === EntityPowerTypes.DEFENSE) {
    await castEntityPowerDefenseShield(actor, power, scaled);
  }
}

/**
 * @param {import('../../../actor/ABFActor').ABFActor} actor
 * @param {{ invocationId: string, entityPowerId: string, useRitualDialog?: boolean }} params
 */
export async function invokeEntityPowerAt(
  actor,
  { invocationId, entityPowerId, useRitualDialog = false }
) {
  const ctx = getEntityPower(actor, invocationId, entityPowerId);
  if (!ctx) return;

  const { power } = ctx;
  const difficulty = Number(power.system?.difficulty?.value ?? 0) || 0;
  const summonFinal = Number(
    actor.system?.mystic?.summoning?.summon?.final?.value ?? 0
  );

  let mod = 0;
  let ritualModifier = 0;

  if (useRitualDialog) {
    const res = await openInvokeEntityPowerDialog();
    if (res.cancelled) return;
    mod = res.mod;
    ritualModifier = res.ritualModifier;
  } else {
    mod =
      Number(
        await openModDialog({
          title: game.i18n.localize('dialogs.invokeEntityPower.modTitle')
        })
      ) || 0;
  }

  const die =
    summonFinal >= 200
      ? actor.system.general.diceSettings.abilityMasteryDie.value
      : actor.system.general.diceSettings.abilityDie.value;

  const roll = new ABFFoundryRoll(
    `${die} + ${summonFinal} + ${mod} + ${ritualModifier}`,
    actor.system
  );
  await roll.evaluate({ async: true });

  const success = roll.total >= difficulty;
  const margin = Math.max(0, roll.total - difficulty);
  const resultLabel = success
    ? game.i18n.localize('anima.ui.mystic.entityPower.invoke.success')
    : game.i18n.localize('anima.ui.mystic.entityPower.invoke.failure');

  const ritualPart =
    ritualModifier !== 0
      ? ` | ${game.i18n.localize('anima.ui.mystic.entityPower.ritualTime.title')}: ${
          ritualModifier > 0 ? '+' : ''
        }${ritualModifier}`
      : '';

  const scaledStatsHtml = success ? buildScaledStatsContent(power, margin) : '';
  const flavor = `${power.name} — ${game.i18n.localize(
    'anima.ui.mystic.summoning.summon.title'
  )} (${game.i18n.localize(
    'anima.ui.mystic.entityPower.difficulty.title'
  )}: ${difficulty})${ritualPart} → ${resultLabel}${
    scaledStatsHtml ? `<div class="entity-power-scaled-stats">${scaledStatsHtml}</div>` : ''
  }`;

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor
  });

  if (success) {
    await applyEntityPowerSuccessEffects(actor, power, margin);
  }
}

export async function invokeEntityPower(sheet, event) {
  const { invocationId, entityPowerId } = event.currentTarget.dataset;
  await invokeEntityPowerAt(sheet.actor, {
    invocationId,
    entityPowerId,
    useRitualDialog: !!event.shiftKey
  });
}

invokeEntityPower.action = 'invokeEntityPower';
