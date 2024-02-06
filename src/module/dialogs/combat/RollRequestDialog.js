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
  const { resistance, specificAttack, critic, withstandPain, check } = roll

  return {
    ui: {
      isGM,
      hasFatiguePoints: actor.system.characteristics.secondaries.fatigue.value > 0,
    },
    tokenDocument: {
      token,
      actor,
      showRoll: !isGM || showRollByDefault,
      withoutRoll: actor.system.general.settings.defenseType.value === 'mass',
      zen: actor.system.general.settings.zen.value,
      inhuman: actor.system.general.settings.inhuman.value,
    },
    roll: {
      resistance,
      value: 0,
      modifier: 0,
      check
    },
    specificAttack,
    critic,
    withstandPain,
    rollSent: false
  };
};

export class RollRequestDialog extends FormApplication {
  constructor(token, roll, hooks) {
    super(getInitialData(token, roll));

    this.modalData = getInitialData(token, roll);



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
    return this.modalData.tokenDocument.actor;
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

    html.find('.send-roll').click(e => {
      const {
        tokenDocument: {
          token,
          actor,
          showRoll,
          withoutRoll },
        roll: {
          resistance,
          modifier,
          check
        },
        specificAttack,
        critic,
        withstandPain
      } = this.modalData;
      const { i18n } = game;
      const resistanceValue = actor.system.characteristics.secondaries.resistances[resistance.main].base.value;

      let formula = `1d100xa + ${resistanceValue} + ${modifier}`;
      if (withoutRoll) {
        // Remove the dice from the formula
        formula = formula.replace('1d100xa', '0');
      }
      if (resistanceValue >= 200) {
        // Mastery reduces the fumble range
        formula = formula.replace('xa', 'xamastery');
      }

      const roll = new ABFFoundryRoll(formula, actor.system);

      roll.roll();

      if (showRoll) {

        const flavor = i18n.format(`macros.combat.dialog.physicalDefense.resist.title`, {
          check
        });

        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ token }),
          flavor
        });
      }

      const rolled = roll.total - resistanceValue - modifier;

      this.hooks.onRoll({
        type: 'roll',
        token,
        values: {
          type: withstandPain ? "withstandPain" : critic ? "critic" : "resistance",
          resistance,
          modifier,
          roll: rolled,
          total: roll.total,
          check
        }
      });

      this.modalData.rollSent = true;

      this.render();
    });
  }

  getData() {
    const {
      tokenDocument: { actor },
      roll: { resistance },
      critic,
      withstandPain
    } = this.modalData;

    if (resistance) {
      this.modalData.roll.value = actor.system.characteristics.secondaries.resistances[resistance.main].base.value
    };

    if (critic) {
      this.modalData.roll.value = critic?.value
    };

    if (withstandPain) {
      this.modalData.roll.value = withstandPain?.value
    };

    return this.modalData;
  }

  async _updateObject(event, formData) {
    this.modalData = mergeObject(this.modalData, formData);

    this.render();
  }
}
