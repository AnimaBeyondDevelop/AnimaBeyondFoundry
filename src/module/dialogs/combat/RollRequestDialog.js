import { Templates } from '../../utils/constants';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { ABFSettingsKeys } from '../../../utils/registerSettings';

const getInitialData = (token, roll) => {
  const showRollByDefault = !!game.settings.get(
    'animabf',
    ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
  );
  const isGM = !!game.user?.isGM;
  const actor = token.actor;
  const { type, resistance, oppousedCheck, critic, check } = roll

  return {
    ui: {
      isGM,
      hasFatiguePoints: actor.system.characteristics.secondaries.fatigue.value > 0,
      characteristics: {
        special: oppousedCheck?.specialCharacteristic ? true : false,
        strength: true,
        agility: false,
        dexterity: false
      },
      resistances: {
        disease: false,
        magic: false,
        physical: false,
        poison: false,
        psychic: false
      }
    },
    token,
    actor,
    showRoll: !isGM || showRollByDefault,
    withoutRoll: actor.system.general.settings.defenseType.value === 'mass',
    roll: {
      type,
      resistance: resistance?.main,
      value: 0,
      modifier: 0,
      fatigueUsed: 0,
      check
    },
    resistance,
    oppousedCheck,
    critic,
    rollSent: false
  };
};

export class RollRequestDialog extends FormApplication {
  constructor(token, roll, hooks) {
    super(getInitialData(token, roll));

    this.modalData = getInitialData(token, roll);
    const { ui: { characteristics, resistances }, roll: { type }, resistance, oppousedCheck } = this.modalData;

    if (oppousedCheck) {
      if (oppousedCheck?.specificAttack === 'disarm') {

        characteristics.dexterity = true

      } else {
        characteristics.agility = !oppousedCheck.attacker
        characteristics.dexterity = oppousedCheck.attacker
      }
    }

    if (type === 'resistance') {
      for (const key in resistances) {
        if (resistance.main === key || resistance.secondary === key) {
          resistances[key] = true
        }
      }
    }

    this.hooks = hooks;

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['abf-dialog roll-request-dialog no-close'],
      submitOnChange: true,
      closeOnSubmit: false,
      width: 525,
      height: 240,
      resizable: true,
      template: Templates.Dialog.Combat.RollRequestDialog,
      title: game.i18n.localize('macros.combat.dialog.rolling.title'),
    });
  }

  get actor() {
    return this.modalData.actor;
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

    html.find('.send-roll').click(() => {
      const {
        token,
        actor,
        showRoll,
        withoutRoll,
        roll: {
          type,
          resistance,
          value,
          modifier,
          fatigueUsed,
          check
        },
        oppousedCheck,
        critic
      } = this.modalData;
      const { i18n } = game;
      let total;
      if (type === 'resistance') {

        let formula = `1d100xa + ${value} + ${modifier}`;
        if (withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (value >= 200) {
          // Mastery reduces the fumble range
          formula = formula.replace('xa', 'xamastery');
        }

        const resistanceRoll = new ABFFoundryRoll(formula, actor.system);

        resistanceRoll.roll();
        total = resistanceRoll.total;

        if (showRoll) {

          const flavor = i18n.format(`macros.combat.dialog.roll.resistanceRoll.title`, {
            check
          });

          resistanceRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ token }),
            flavor
          });
        }
      }
      if (type === 'critic') {
        const { targeted, generalLocation, location, defender } = critic

        let formula = `1d100CriticRoll + ${value} + ${modifier}`;
        if (withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100CriticRoll', '0');
        }
        const criticRoll = new ABFFoundryRoll(formula, actor.system);

        criticRoll.roll();
        total = criticRoll.total;

        if (showRoll) {
          let flavor;

          if (targeted || generalLocation?.side === undefined || generalLocation?.side === 'none') {
            flavor = `${i18n.format(`macros.combat.dialog.hasCritic.title`, {
              target: defender
            })} ( ${i18n.format(`macros.combat.dialog.targetedAttack.${location}.title`)} )`;
          } else {
            flavor = `${i18n.format(`macros.combat.dialog.hasCritic.title`, {
              target: defender
            })} ( ${i18n.format(
              `macros.combat.dialog.targetedAttack.${location}.title`
            )} ) ${i18n.format(
              `macros.combat.dialog.targetedAttack.side.${generalLocation.side}.title`
            )}`;
          }

          criticRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ token }),
            flavor
          });
        }
      }
      if (type === 'oppousedCheck') {
        let formula = `1d10ControlRoll + ${value} + ${oppousedCheck.modifier ?? 0} + ${fatigueUsed} + ${modifier}`;
        if (withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d10ControlRoll', '0');
        }
        const oppousedCheckRoll = new ABFFoundryRoll(formula, actor.system);

        oppousedCheckRoll.roll();
        total = oppousedCheckRoll.total;

        if (showRoll) {
          const flavor = i18n.format(
            'macros.combat.dialog.roll.oppousedCheckRoll.title',
          );
          oppousedCheckRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ token }),
            flavor
          });
        }
      }

      this.hooks.onRoll({
        type,
        token,
        values: {
          resistance,
          modifier,
          fatigueUsed,
          total,
          check,
          characteristic: oppousedCheck?.characteristic
        }
      });

      this.modalData.rollSent = true;

      this.render();
    });
  }

  getData() {
    const {
      ui,
      actor,
      roll: { resistance, type },
      critic,
      oppousedCheck
    } = this.modalData;

    if (type === 'resistance') {
      this.modalData.roll.value = actor.system.characteristics.secondaries.resistances[resistance].final.value
    };

    if (type === 'critic') {
      this.modalData.roll.value = critic.damage;
    };

    if (type === 'oppousedCheck') {
      if (!oppousedCheck?.characteristic) {
        const { strength, agility, dexterity } = actor.system.characteristics.primaries
        if (ui.characteristics.agility) {
          oppousedCheck.characteristic = strength.value > agility.value ? 'strength' : 'agility'
        } else {
          oppousedCheck.characteristic = strength.value > dexterity.value ? 'strength' : 'dexterity'
        }
      }
      if (oppousedCheck?.characteristic === 'special') {

        this.modalData.roll.value = oppousedCheck.specialCharacteristic;

      } else {
        this.modalData.roll.value = actor.system.characteristics.primaries[oppousedCheck.characteristic].value;
      }
    };

    return this.modalData;
  }

  async _updateObject(event, formData) {
    this.modalData = mergeObject(this.modalData, formData);

    this.render();
  }
}
