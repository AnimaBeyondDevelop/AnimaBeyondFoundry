import { Templates } from '../../utils/constants';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { NoneWeaponCritic, WeaponCritic } from '../../types/combat/WeaponItemConfig';
import { ABFSettingsKeys } from '../../../utils/registerSettings';

const getInitialData = (attacker, defender) => {
  const showRollByDefault = !!game.settings.get(
    'animabf',
    ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
  );
  const isGM = !!game.user?.isGM;

  const attackerActor = attacker.token.actor;
  const defenderActor = defender.actor;

  const activeTab =
    defenderActor.system.general.settings.defenseType.value === 'resistance'
      ? 'damageResistance'
      : 'combat';

  return {
    ui: {
      isGM,
      hasFatiguePoints:
        defenderActor.system.characteristics.secondaries.fatigue.value > 0,
      activeTab
    },
    attacker: {
      token: attacker.token,
      actor: attackerActor,
      attackType: attacker.attackType,
      critic: attacker.critic
    },
    defender: {
      token: defender,
      actor: defenderActor,
      showRoll: !isGM || showRollByDefault,
      withoutRoll: defenderActor.system.general.settings.defenseType.value === 'mass',
      combat: {
        fatigue: 0,
        multipleDefensesPenalty: 0,
        modifier: 0,
        weaponUsed: undefined,
        weapon: undefined,
        unarmed: false,
        at: {
          special: 0,
          final: 0
        }
      },
      mystic: {
        modifier: 0,
        magicProjectionType: 'normal',
        spellUsed: undefined,
        spellGrade: 'base'
      },
      psychic: {
        modifier: 0,
        psychicPotential: {
          special: 0,
          final: defenderActor.system.psychic.psychicPotential.final.value
        },
        psychicProjection:
          defenderActor.system.psychic.psychicProjection.imbalance.defensive.final.value,
        powerUsed: undefined
      },
      resistance: {
        surprised: false
      }
    },
    defenseSent: false
  };
};

export class CombatDefenseDialog extends FormApplication {
  constructor(attacker, defender, hooks) {
    super(getInitialData(attacker, defender));

    this.modalData = getInitialData(attacker, defender);
    this._tabs[0].callback = (event, tabs, tabName) => {
      this.modalData.ui.activeTab = tabName;
      this.render(true);
    };

    const { weapons } = this.defenderActor.system.combat;

    if (weapons.length > 0) {
      this.modalData.defender.combat.weaponUsed = weapons[0]._id;
    } else {
      this.modalData.defender.combat.unarmed = true;
    }

    this.hooks = hooks;

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['abf-dialog combat-defense-dialog no-close'],
      submitOnChange: true,
      closeOnSubmit: false,
      width: 525,
      height: 240,
      resizable: true,
      template: Templates.Dialog.Combat.CombatDefenseDialog.main,
      title: game.i18n.localize('macros.combat.dialog.defending.defend.title'),
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'combat'
        }
      ]
    });
  }

  get attackerActor() {
    return this.modalData.attacker.token.actor;
  }

  get defenderActor() {
    return this.modalData.defender.token.actor;
  }

  async close(options) {
    if (options?.force) {
      return super.close(options);
    }

    // eslint-disable-next-line no-useless-return,consistent-return
    return;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.send-defense').click(e => {
      const { fatigue, modifier, weapon, multipleDefensesPenalty, at } =
        this.modalData.defender.combat;

      const type = e.currentTarget.dataset.type === 'dodge' ? 'dodge' : 'block';

      let value;
      let baseDefense;
      if (e.currentTarget.dataset.type === 'dodge') {
        value = this.defenderActor.system.combat.dodge.final.value;
        baseDefense = this.defenderActor.system.combat.dodge.base.value;
      } else {
        value = weapon
          ? weapon.system.block.final.value
          : this.defenderActor.system.combat.block.final.value;
        baseDefense = this.defenderActor.system.combat.block.base.value;
      }

      let formula = `1d100xa + ${modifier ?? 0} + ${fatigue ?? 0} * 15 - ${
        (multipleDefensesPenalty ?? 0) * -1
      } + ${value}`;
      if (this.modalData.defender.withoutRoll) {
        // Remove the dice from the formula
        formula = formula.replace('1d100xa', '0');
      }
      if (baseDefense >= 200) {
        // Mastery reduces the fumble range
        formula = formula.replace('xa', 'xamastery');
      }

      const roll = new ABFFoundryRoll(formula, this.defenderActor.system);

      roll.roll();

      if (this.modalData.defender.showRoll) {
        const { i18n } = game;

        const flavor = i18n.format(`macros.combat.dialog.physicalDefense.${type}.title`, {
          target: this.modalData.attacker.token.name
        });

        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
          flavor
        });
      }

      const rolled =
        roll.total -
        (modifier ?? 0) -
        (fatigue ?? 0) * 15 -
        (multipleDefensesPenalty ?? 0) -
        value;

      this.hooks.onDefense({
        type: 'combat',
        values: {
          type,
          multipleDefensesPenalty,
          modifier,
          fatigue,
          at: at.final,
          defense: value,
          roll: rolled,
          total: roll.total
        }
      });

      this.modalData.defenseSent = true;

      this.render();
    });

    html.find('.send-defense-damage-resistance').click(() => {
      const { at } = this.modalData.defender.combat;
      const { surprised } = this.modalData.defender.resistance;
      this.hooks.onDefense({
        type: 'resistance',
        values: {
          at: at.final,
          surprised,
          total: 0
        }
      });

      this.modalData.defenseSent = true;

      this.render();
    });

    html.find('.send-mystic-defense').click(() => {
      const { modifier, spellUsed, spellGrade } = this.modalData.defender.mystic;
      const { at } = this.modalData.defender.combat;

      if (spellUsed) {
        const magicProjection =
          this.defenderActor.system.mystic.magicProjection.imbalance.defensive.final
            .value;
        const baseMagicProjection =
          this.defenderActor.system.mystic.magicProjection.imbalance.defensive.base.value;

        let formula = `1d100xa + ${magicProjection} + ${modifier ?? 0}`;
        if (this.modalData.defender.withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (baseMagicProjection >= 200) {
          // Mastery reduces the fumble range
          formula = formula.replace('xa', 'xamastery');
        }

        const roll = new ABFFoundryRoll(formula, this.attackerActor.system);
        roll.roll();

        if (this.modalData.defender.showRoll) {
          const { i18n } = game;

          const { spells } = this.defenderActor.system.mystic;

          const spell = spells.find(w => w._id === spellUsed);

          const flavor = i18n.format('macros.combat.dialog.magicDefense.title', {
            spell: spell.name,
            target: this.modalData.attacker.token.name
          });

          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
            flavor
          });
        }

        const rolled = roll.total - magicProjection - (modifier ?? 0);

        this.hooks.onDefense({
          type: 'mystic',
          values: {
            modifier,
            magicProjection,
            spellGrade,
            spellUsed,
            at: at.final,
            roll: rolled,
            total: roll.total
          }
        });

        this.modalData.defenseSent = true;

        this.render();
      }
    });

    html.find('.send-psychic-defense').click(() => {
      const { psychicProjection, psychicPotential, powerUsed, modifier } =
        this.modalData.defender.psychic;
      const { at } = this.modalData.defender.combat;

      if (powerUsed) {
        let formula = `1d100xa + ${psychicProjection} + ${modifier ?? 0}`;
        if (this.modalData.defender.withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (this.defenderActor.system.psychic.psychicProjection.base.value >= 200) {
          // Mastery reduces the fumble range
          formula = formula.replace('xa', 'xamastery');
        }

        const roll = new ABFFoundryRoll(formula, this.defenderActor.system);
        roll.roll();

        if (this.modalData.defender.showRoll) {
          const { i18n } = game;

          const powers = this.defenderActor.system.psychic.psychicPowers;

          const power = powers.find(w => w._id === powerUsed);

          const flavor = i18n.format('macros.combat.dialog.psychicDefense.title', {
            power: power.name,
            target: this.modalData.attacker.token.name
          });

          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
            flavor
          });
        }

        const rolled = roll.total - psychicProjection - (modifier ?? 0);

        this.hooks.onDefense({
          type: 'psychic',
          values: {
            modifier,
            powerUsed,
            psychicProjection,
            psychicPotential: psychicPotential.final,
            at: at.final,
            roll: rolled,
            total: roll.total
          }
        });

        this.modalData.defenseSent = true;

        this.render();
      }
    });
  }

  getData() {
    this.modalData.ui.hasFatiguePoints =
      this.defenderActor.system.characteristics.secondaries.fatigue.value > 0;

    this.modalData.defender.psychic.psychicPotential.final =
      this.modalData.defender.psychic.psychicPotential.special +
      this.defenderActor.system.psychic.psychicPotential.final.value;

    let at;

    if (this.modalData.attacker.critic !== NoneWeaponCritic.NONE) {
      switch (this.modalData.attacker.critic) {
        case WeaponCritic.CUT:
          at = this.defenderActor.system.combat.totalArmor.at.cut.value;
          break;
        case WeaponCritic.IMPACT:
          at = this.defenderActor.system.combat.totalArmor.at.impact.value;
          break;
        case WeaponCritic.THRUST:
          at = this.defenderActor.system.combat.totalArmor.at.thrust.value;
          break;
        case WeaponCritic.HEAT:
          at = this.defenderActor.system.combat.totalArmor.at.heat.value;
          break;
        case WeaponCritic.ELECTRICITY:
          at = this.defenderActor.system.combat.totalArmor.at.electricity.value;
          break;
        case WeaponCritic.COLD:
          at = this.defenderActor.system.combat.totalArmor.at.cold.value;
          break;
        case WeaponCritic.ENERGY:
          at = this.defenderActor.system.combat.totalArmor.at.energy.value;
          break;
        default:
          at = undefined;
      }
    }

    if (at !== undefined) {
      this.modalData.defender.combat.at.final =
        this.modalData.defender.combat.at.special + at;
    }

    const { combat } = this.modalData.defender;

    const { weapons } = this.defenderActor.system.combat;
    combat.weapon = weapons.find(w => w._id === combat.weaponUsed);

    return this.modalData;
  }

  async _updateObject(event, formData) {
    this.modalData = mergeObject(this.modalData, formData);

    this.render();
  }
}
