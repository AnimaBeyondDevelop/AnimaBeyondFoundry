import { Templates } from '../utils/constants';
import { ABFAttackData } from '../combat/ABFAttackData';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll.js';
import { ABFConfig } from '../ABFConfig';
import { getSnapshotTargets } from '../actor/utils/getSnapshotTargets.js';

export class SpellAttackConfigurationDialog extends FormApplication {
  constructor(object = {}, options = {}) {
    const base = SpellAttackConfigurationDialog._buildInitialData(object);
    super(base, options);
    this.modalData = base;
    this.render(true);
  }

  static _buildInitialData({ attacker, spell, spellId, grade, targets }) {
    if (!attacker?.actor) return { allowed: false };

    const actor = attacker.actor;
    const resolvedSpell = spell ?? (spellId ? actor.items.get(spellId) : null);

    const fallbackSnapshot = getSnapshotTargets();

    return {
      allowed: true,
      attackSent: false,
      config: ABFConfig,
      attacker: {
        token: attacker,
        actor,
        spell: resolvedSpell,
        grade: grade ?? 'base',
        combat: {
          modifier: 0,
          damage: { special: 0, final: 0 }
        }
      },
      targets: Array.isArray(targets) && targets.length ? targets : fallbackSnapshot
    };
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['animabf-dialog', 'spell-attack-config-dialog'],
      submitOnChange: true,
      closeOnSubmit: false,
      resizable: true,
      template: Templates.Dialog.SpellAttackConfigDialog,
      title: game.i18n.localize('macros.combat.dialog.modal.attack.title')
    });
  }

  getData() {
    const data = this.modalData;
    const attacker = data?.attacker;

    if (!attacker?.spell) return data;

    const grade = attacker.grade ?? 'base';
    const gradeData = attacker.spell.system?.grades?.[grade];

    const baseDamage = Number(gradeData?.damage?.value ?? 0) || 0;
    const bonusDamage = Number(attacker.combat?.damage?.special ?? 0) || 0;

    attacker.combat.damage.final = baseDamage + bonusDamage;

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.send-attack').on('click', async ev => {
      ev.preventDefault();
      await this._sendAttack();
    });
  }

  async _sendAttack() {
    const attacker = this.modalData?.attacker;
    const actor = attacker?.actor;
    const spell = attacker?.spell;
    const grade = attacker?.grade ?? 'base';

    if (!actor) return ui.notifications?.warn('Actor no encontrado.');
    if (!spell) return ui.notifications?.warn('Hechizo no encontrado.');

    try {
      this.modalData.attackSent = true;
      this.render();

      const gradeData = spell.system?.grades?.[grade];
      const baseDamage = Number(gradeData?.damage?.value ?? 0) || 0;
      const bonusDamage = Number(attacker.combat?.damage?.special ?? 0) || 0;
      const finalDamage = baseDamage + bonusDamage;

      const mod = Number(attacker.combat?.modifier ?? 0) || 0;

      const mpBase = Number(
        actor.system?.mystic?.magicProjection?.imbalance?.offensive?.base?.value ?? 0
      );

      const mpFinal = Number(
        actor.system?.mystic?.magicProjection?.imbalance?.offensive?.final?.value ??
          mpBase
      );

      const die =
        mpBase >= 200
          ? actor.system?.general?.diceSettings?.abilityMasteryDie?.value
          : actor.system?.general?.diceSettings?.abilityDie?.value;

      const roll = new ABFFoundryRoll(`${die} + ${mpFinal} + ${mod}`, actor.system);
      await roll.evaluate({ async: true });

      const token = attacker.token?.object ?? attacker.token ?? null;
      const speaker = token
        ? ChatMessage.getSpeaker({ token })
        : ChatMessage.getSpeaker({ actor });

      const gradeLabel = game.i18n.localize(`anima.ui.mystic.spell.grade.${grade}.title`);

      await roll.toMessage({
        speaker,
        flavor: `${spell.name} (${gradeLabel})`
      });

      const attackData = ABFAttackData.builder()
        .attackAbility(roll.total)
        .damage(finalDamage)
        .ignoreArmor(false)
        .reducedArmor(0)
        .armorType(
          spell.system?.critic?.value ?? game.animabf.weapon.NoneWeaponCritic.NONE
        )
        .damageType(game.animabf.combat.DamageType.NONE)
        .presence(0)
        .isProjectile(true)
        .automaticCrit(false)
        .critBonus(0)
        .attackerId(actor.id)
        .weaponId(spell.id)
        .targets(this.modalData.targets ?? [])
        .build();

      await attackData.toChatMessage({ actor, weapon: spell });
      await this.close();
    } catch (err) {
      console.error(err);
      ui.notifications?.error('Error al lanzar el conjuro.');
    } finally {
      this.modalData.attackSent = false;
      if (this.rendered) this.render();
    }
  }

  async _updateObject(_event, formData) {
    this.modalData = foundry.utils.mergeObject(this.modalData, formData);
    this.render();
  }
}
