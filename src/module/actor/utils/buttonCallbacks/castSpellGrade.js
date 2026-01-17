import ABFFoundryRoll from '../../../rolls/ABFFoundryRoll.js';
import { ABFAttackData } from '../../../combat/ABFAttackData.js';
import { ABFSupernaturalShieldData } from '../../../combat/ABFSupernaturalShieldData.js';
import { shieldValueCheck } from '../../../combat/utils/shieldValueCheck.js';
import { Templates } from '../../../utils/constants';
import { openModDialog } from '../../../utils/dialogs/openSimpleInputDialog.js';
import { SpellAttackConfigurationDialog } from '../../../dialogs/SpellAttackConfigurationDialog.js';
import { getSnapshotTargets } from '../getSnapshotTargets.js';

function localizeGrade(grade) {
  return game.i18n.localize(`anima.ui.mystic.spell.grade.${grade}.title`);
}

async function openShieldConfigDialog({ spell, grade }) {
  const content = await renderTemplate(Templates.Dialog.SpellShieldConfigDialog, {
    formulaBonus: 0
  });

  return new Promise(resolve => {
    new Dialog({
      title: `${spell.name} (${localizeGrade(grade)})`,
      content,
      buttons: {
        ok: {
          label: 'OK',
          callback: html => {
            const bonus = Number(html.find('input[name="formulaBonus"]').val() ?? 0) || 0;
            resolve({ bonus, cancelled: false });
          }
        },
        cancel: {
          label: 'Cancel',
          callback: () => resolve({ cancelled: true })
        }
      },
      default: 'ok'
    }).render(true);
  });
}

export async function castSpellGrade(sheet, event) {
  const { spellId, grade } = event.currentTarget.dataset;
  const useDialog = !!event.shiftKey;

  const actor = sheet.actor;
  const spell = actor.items.get(spellId);
  const combatType = spell.system.combatType.value;

  // ---------- DEFENSE ----------
  if (combatType === 'defense') {
    const gradeData = spell.system.grades[grade];
    const shieldPoints = Number(shieldValueCheck(gradeData)) || 0;
    const baseFormula = '@mystic.magicProjection.imbalance.defensive.final.value';

    let abilityFormula = baseFormula;

    if (useDialog) {
      const res = await openShieldConfigDialog({ spell, grade });
      if (res.cancelled) return;
      if (res.bonus !== 0) abilityFormula = `${baseFormula} + ${res.bonus}`;
    }

    await actor.newSupernaturalShield(
      ABFSupernaturalShieldData.builder()
        .name(`${spell.name} (${localizeGrade(grade)})`)
        .shieldPoints(shieldPoints)
        .abilityFormula(abilityFormula)
        .flags({ animabf: { supernaturalShield: { type: 'mystic' } } })
        .build()
    );

    return;
  }

  // ---------- ATTACK ----------
  if (useDialog) {
    const token =
      sheet.token?.document ?? sheet.token ?? actor.getActiveTokens()[0]?.document;

    new SpellAttackConfigurationDialog({
      attacker: token,
      spell,
      grade,
      targets: getSnapshotTargets()
    });

    return;
  }

  // Quick attack
  const mod = Number(await openModDialog()) || 0;

  const baseMP = actor.system.mystic.magicProjection.imbalance.offensive.base.value;
  const die = baseMP >= 200 ? '1d100xamastery' : '1d100xa';

  const roll = new ABFFoundryRoll(`${die} + ${baseMP} + ${mod}`, actor.system);
  await roll.evaluate({ async: true });

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${spell.name} (${localizeGrade(grade)})`
  });

  const baseDamage = Number(spell.system.grades[grade]?.damage?.value ?? 0);

  await ABFAttackData.builder()
    .attackAbility(roll.total)
    .damage(baseDamage)
    .ignoreArmor(false)
    .reducedArmor(0)
    .armorType(spell.system.critic?.value ?? game.animabf.weapon.NoneWeaponCritic.NONE)
    .damageType(game.animabf.combat.DamageType.NONE)
    .presence(0)
    .isProjectile(true)
    .automaticCrit(false)
    .critBonus(0)
    .attackerId(actor.id)
    .weaponId(spell.id)
    .targets(getSnapshotTargets())
    .build()
    .toChatMessage({ actor, weapon: spell });
}

castSpellGrade.action = 'castSpellGrade';
