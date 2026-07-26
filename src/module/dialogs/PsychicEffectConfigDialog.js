import { Templates } from '../utils/constants.js';
import { ABFConfig } from '../ABFConfig.js';
import {
  resistanceCheckDialogData,
  resistanceCheckFromFormData
} from '../types/common/resistanceCheck.js';

/**
 * Secondary editor for a single psychic power difficulty/effect.
 * Combat-specific fields depend on the power combatType.
 */
export class PsychicEffectConfigDialog extends FormApplication {
  /**
   * @param {Item} item
   * @param {{ difficultyKey: string }} options
   */
  constructor(item, { difficultyKey }) {
    super({}, {});
    this.item = item;
    this.difficultyKey = String(difficultyKey);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'abf-psychic-effect-config',
      classes: ['animabf-dialog', 'psychic-effect-config-dialog'],
      template: Templates.Dialog.PsychicEffectConfigDialog,
      width: 540,
      closeOnSubmit: true,
      submitOnChange: false,
      resizable: true
    });
  }

  get title() {
    return `${this.item?.name ?? ''} — ${this.difficultyKey}`;
  }

  getData() {
    const effect = this.item?.system?.effects?.[this.difficultyKey] ?? {};
    const combatType = this.item?.system?.combatType?.value ?? '';
    return {
      difficultyKey: this.difficultyKey,
      combatType,
      isAttack: combatType === 'attack',
      isDefense: combatType === 'defense',
      value: effect.value ?? '',
      fatigue: Number(effect.fatigue?.value ?? 0) || 0,
      damage: Number(effect.damage?.value ?? 0) || 0,
      area: effect.area?.value ?? 0,
      isArea: !!effect.isArea?.value,
      shieldPoints: Number(effect.shieldPoints?.value ?? 0) || 0,
      reducedArmor: Number(effect.reducedArmor?.value ?? 0) || 0,
      critBonus: Number(effect.critBonus?.value ?? 0) || 0,
      automaticCrit: !!effect.automaticCrit?.value,
      affectsInmaterial: !!effect.affectsInmaterial?.value,
      ...resistanceCheckDialogData(effect.resistanceEffect, ABFConfig)
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('input[name="isArea"]').on('change', event => {
      html.find('.area-field').toggle(!!event.currentTarget.checked);
    });

    const syncResistanceSelectionVisibility = () => {
      const checked = html.find('.resistance-type-checkbox:checked').length;
      html.find('.resistance-selection-field').toggle(checked > 1);
    };
    html.find('.resistance-type-checkbox').on('change', syncResistanceSelectionVisibility);
  }

  async _updateObject(_event, formData) {
    const prefix = `system.effects.${this.difficultyKey}`;
    const combatType = this.item?.system?.combatType?.value ?? '';
    const isArea = formData.isArea === 'on' || formData.isArea === true;
    const update = {
      [`${prefix}.value`]: String(formData.value ?? ''),
      [`${prefix}.fatigue.value`]: Number(formData.fatigue ?? 0) || 0,
      [`${prefix}.isArea.value`]: isArea,
      [`${prefix}.area.value`]: formData.area ?? 0,
      [`${prefix}.resistanceEffect`]: resistanceCheckFromFormData(formData, {
        prefix: 'resistance',
        scalable: false
      })
    };

    if (combatType === 'attack') {
      update[`${prefix}.damage.value`] = Number(formData.damage ?? 0) || 0;
      update[`${prefix}.reducedArmor.value`] = Number(formData.reducedArmor ?? 0) || 0;
      update[`${prefix}.critBonus.value`] = Number(formData.critBonus ?? 0) || 0;
      update[`${prefix}.automaticCrit.value`] =
        formData.automaticCrit === 'on' || formData.automaticCrit === true;
      update[`${prefix}.affectsInmaterial.value`] =
        formData.affectsInmaterial === 'on' || formData.affectsInmaterial === true;
    } else if (combatType === 'defense') {
      update[`${prefix}.shieldPoints.value`] = Number(formData.shieldPoints ?? 0) || 0;
    }

    await this.item.update(update);
  }
}
