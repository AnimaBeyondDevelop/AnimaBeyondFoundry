import { Templates } from '../utils/constants.js';

const PENALTY_KEYS = ['fatigue', 'pain', 'physicalDeficiency', 'supernatural'];

/**
 * @param {object | undefined} node
 * @param {{ withMultiplier?: boolean }} [options]
 */
function readPenalty(node, { withMultiplier = true } = {}) {
  return {
    base: Number(node?.base?.value ?? 0) || 0,
    special: Number(node?.special?.value ?? 0) || 0,
    multiplier: withMultiplier
      ? node?.multiplier?.value === undefined || node?.multiplier?.value === null
        ? 1
        : Number(node.multiplier.value) || 0
      : undefined,
    final: Number(node?.final?.value ?? 0) || 0
  };
}

/**
 * Dialog to inspect / edit all-actions penalty breakdown and bonuses.
 */
export class AllActionsBreakdownDialog extends FormApplication {
  /**
   * @param {Actor} actor
   */
  constructor(actor) {
    super({}, {});
    this.actor = actor;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'abf-all-actions-breakdown',
      classes: ['animabf-dialog', 'all-actions-breakdown-dialog'],
      template: Templates.Dialog.AllActionsBreakdownDialog,
      width: 640,
      closeOnSubmit: true,
      submitOnChange: false,
      resizable: true
    });
  }

  get title() {
    return game.i18n.localize('anima.ui.general.modifiers.allActions.breakdown.title');
  }

  getData() {
    const penalties = this.actor.system?.general?.modifiers?.allActionsPenalties ?? {};
    const allActions = this.actor.system?.general?.modifiers?.allActions ?? {};
    const bonus = allActions.bonus ?? {};

    return {
      penalties: {
        fatigue: readPenalty(penalties.fatigue),
        pain: readPenalty(penalties.pain),
        physicalDeficiency: readPenalty(penalties.physicalDeficiency),
        supernatural: readPenalty(penalties.supernatural)
      },
      withstandPainMitigation: Number(penalties.withstandPainMitigation?.value ?? 0) || 0,
      bonus: {
        base: Number(bonus.base?.value ?? 0) || 0,
        special: Number(bonus.special?.value ?? 0) || 0,
        final: Number(bonus.final?.value ?? 0) || 0
      },
      allActionsBase: Number(allActions.base?.value ?? 0) || 0,
      allActionsFinal: Number(allActions.final?.value ?? 0) || 0
    };
  }

  async _updateObject(_event, formData) {
    /** @type {Record<string, number|boolean>} */
    const update = {};

    for (const key of PENALTY_KEYS) {
      const prefix = `system.general.modifiers.allActionsPenalties.${key}`;
      update[`${prefix}.special.value`] = Number(formData[`${key}Special`] ?? 0) || 0;
      update[`${prefix}.multiplier.value`] =
        formData[`${key}Multiplier`] === undefined || formData[`${key}Multiplier`] === null
          ? 1
          : Number(formData[`${key}Multiplier`]) || 0;
    }

    update['system.general.modifiers.allActionsPenalties.withstandPainMitigation.value'] =
      Math.max(0, Number(formData.withstandPainMitigation ?? 0) || 0);

    update['system.general.modifiers.allActions.bonus.special.value'] =
      Number(formData.bonusSpecial ?? 0) || 0;

    await this.actor.update(update);
  }
}
