import ABFFoundryRoll from '../../../rolls/ABFFoundryRoll.js';
import { ABFAttackData } from '../../../combat/ABFAttackData.js';
import { Templates } from '../../../utils/constants';
import { openModDialog } from '../../../utils/dialogs/openSimpleInputDialog.js';
import { SpellAttackConfigurationDialog } from '../../../dialogs/SpellAttackConfigurationDialog.js';
import { getSnapshotTargets } from '../getSnapshotTargets.js';
import { combineMassAttackDamage } from '../applyMassAttackDamage.js';
import {
  castMysticDefenseShield,
  getMysticShieldName,
  localizeMysticSpellGrade
} from '../../../mystic/utils/mysticDefenseShield.js';
import { SpellGrades } from '../../../types/mystic/SpellItemConfig.js';

async function openShieldConfigDialog({ spell, grade }) {
  const content = await (
    foundry.applications?.handlebars?.renderTemplate ?? renderTemplate
  )(Templates.Dialog.SpellShieldConfigDialog, {
    formulaBonus: 0
  });

  return new Promise(resolve => {
    new Dialog({
      title: getMysticShieldName(spell, grade),
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

/**
 * @param {object} [params]
 * @param {string} [params.defaultGrade]
 * @returns {Promise<{ grade?: string, cancelled: boolean }>}
 */
export async function openSpellGradeDialog({ defaultGrade = SpellGrades.BASE } = {}) {
  const { i18n } = game;
  const options = Object.values(SpellGrades)
    .map(
      grade =>
        `<option value="${grade}"${grade === defaultGrade ? ' selected' : ''}>${i18n.localize(
          `dialogs.spellGrade.${grade}.title`
        )}</option>`
    )
    .join('');

  const content = `
    <form>
      <div class="form-group">
        <label>${i18n.localize('dialogs.spellGrade.title')}</label>
        <select name="grade">${options}</select>
      </div>
    </form>
  `;

  return new Promise(resolve => {
    new Dialog({
      title: i18n.localize('dialogs.castSpell.title'),
      content,
      buttons: {
        ok: {
          label: i18n.localize('dialogs.continue'),
          callback: html => {
            const grade = html.find('[name="grade"]').val();
            resolve({ grade, cancelled: false });
          }
        },
        cancel: {
          label: i18n.localize('dialogs.cancel'),
          callback: () => resolve({ cancelled: true })
        }
      },
      default: 'ok'
    }).render(true);
  });
}

/**
 * @param {Actor} actor
 * @param {object} params
 * @param {string} params.spellId
 * @param {string} params.grade
 * @param {TokenDocument | object | null} [params.token]
 * @param {boolean} [params.useDialog]
 */
export async function castSpellAtGrade(actor, { spellId, grade, token, useDialog = false }) {
  const spell = actor.items.get(spellId);
  if (!spell) {
    ui.notifications?.warn('Conjuro no encontrado.');
    return;
  }

  const combatType = spell.system.combatType.value;

  // ---------- DEFENSE ----------
  if (combatType === 'defense') {
    let formulaBonus = 0;

    if (useDialog) {
      const res = await openShieldConfigDialog({ spell, grade });
      if (res.cancelled) return;
      formulaBonus = res.bonus;
    }

    await castMysticDefenseShield({ actor, spell, grade, formulaBonus });

    return;
  }

  // ---------- ATTACK ----------
  if (useDialog) {
    const attackerToken =
      token?.document ?? token ?? actor.getActiveTokens()[0]?.document;

    new SpellAttackConfigurationDialog({
      attacker: attackerToken,
      spell,
      grade,
      targets: getSnapshotTargets()
    });

    return;
  }

  // Quick attack
  const mod = Number(await openModDialog()) || 0;

  const offensiveProjection = actor.system.mystic.magicProjection.imbalance.offensive;
  const hasMastery = offensiveProjection.base.value >= 200;
  const die = hasMastery ? '1d100xamastery' : '1d100xa';

  const roll = new ABFFoundryRoll(
    `${die} + ${offensiveProjection.final.value} + ${mod}`,
    actor.system
  );
  await roll.evaluate({ async: true });

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${spell.name} (${localizeMysticSpellGrade(grade)})`
  });

  const baseDamage = combineMassAttackDamage(
    actor,
    Number(spell.system.grades[grade]?.damage?.value ?? 0),
    0,
    { supernatural: true }
  );

  await ABFAttackData.builder()
    .attackAbility(roll.total)
    .damage(baseDamage)
    .ignoreArmor(false)
    .reducedArmor(Number(spell.system.grades?.[grade]?.reducedArmor?.value ?? 0))
    .armorType(spell.system.critic?.value ?? game.animabf.weapon.NoneWeaponCritic.NONE)
    .damageType(game.animabf.combat.DamageType.NONE)
    .presence(0)
    .isProjectile(true)
    .automaticCrit(
      !!spell.system.grades?.[grade]?.automaticCrit?.value ||
        !!actor.system.general.modifiers.automaticCrit?.value
    )
    .critBonus(
      Number(spell.system.grades?.[grade]?.critBonus?.value ?? 0) +
        Number(actor.system.general.modifiers.critDamageBonus?.final?.value ?? 0)
    )
    .critDamageBonus(0)
    .attackerId(actor.id)
    .weaponId(spell.id)
    .targets(getSnapshotTargets())
    .build()
    .toChatMessage({ actor, weapon: spell });
}

export async function castSpellGrade(sheet, event) {
  const { spellId, grade } = event.currentTarget.dataset;

  await castSpellAtGrade(sheet.actor, {
    spellId,
    grade,
    token: sheet.token?.document ?? sheet.token ?? null,
    useDialog: !!event.shiftKey
  });
}

castSpellGrade.action = 'castSpellGrade';
