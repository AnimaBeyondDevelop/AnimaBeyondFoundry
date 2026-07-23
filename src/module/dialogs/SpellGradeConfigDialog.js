import { Templates } from '../utils/constants.js';

/**
 * Secondary editor for a single spell grade.
 * Combat-specific fields depend on the spell combatType.
 */
export class SpellGradeConfigDialog extends FormApplication {
  /**
   * @param {Item} item
   * @param {{ gradeKey: string }} options
   */
  constructor(item, { gradeKey }) {
    super({}, {});
    this.item = item;
    this.gradeKey = gradeKey;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'abf-spell-grade-config',
      classes: ['animabf-dialog', 'spell-grade-config-dialog'],
      template: Templates.Dialog.SpellGradeConfigDialog,
      width: 420,
      closeOnSubmit: true,
      submitOnChange: false,
      resizable: true
    });
  }

  get title() {
    const gradeLabel = game.i18n.localize(
      `anima.ui.mystic.spell.grade.${this.gradeKey}.title`
    );
    return `${this.item?.name ?? ''} — ${gradeLabel}`;
  }

  getData() {
    const grade = this.item?.system?.grades?.[this.gradeKey] ?? {};
    const combatType = this.item?.system?.combatType?.value ?? '';
    return {
      gradeKey: this.gradeKey,
      combatType,
      isAttack: combatType === 'attack',
      isDefense: combatType === 'defense',
      intRequired: Number(grade.intRequired?.value ?? 0) || 0,
      zeon: Number(grade.zeon?.value ?? 0) || 0,
      maintenanceCost: grade.maintenanceCost?.value ?? 0,
      description: grade.description?.value ?? '',
      area: grade.area?.value ?? 0,
      damage: Number(grade.damage?.value ?? 0) || 0,
      shieldPoints: Number(grade.shieldPoints?.value ?? 0) || 0,
      reducedArmor: Number(grade.reducedArmor?.value ?? 0) || 0,
      critBonus: Number(grade.critBonus?.value ?? 0) || 0,
      automaticCrit: !!grade.automaticCrit?.value
    };
  }

  async _updateObject(_event, formData) {
    const prefix = `system.grades.${this.gradeKey}`;
    const combatType = this.item?.system?.combatType?.value ?? '';
    const update = {
      [`${prefix}.intRequired.value`]: Number(formData.intRequired ?? 0) || 0,
      [`${prefix}.zeon.value`]: Number(formData.zeon ?? 0) || 0,
      [`${prefix}.maintenanceCost.value`]: formData.maintenanceCost ?? 0,
      [`${prefix}.description.value`]: String(formData.description ?? ''),
      [`${prefix}.area.value`]: formData.area ?? 0
    };

    if (combatType === 'attack') {
      update[`${prefix}.damage.value`] = Number(formData.damage ?? 0) || 0;
      update[`${prefix}.reducedArmor.value`] = Number(formData.reducedArmor ?? 0) || 0;
      update[`${prefix}.critBonus.value`] = Number(formData.critBonus ?? 0) || 0;
      update[`${prefix}.automaticCrit.value`] =
        formData.automaticCrit === 'on' || formData.automaticCrit === true;
    } else if (combatType === 'defense') {
      update[`${prefix}.shieldPoints.value`] = Number(formData.shieldPoints ?? 0) || 0;
    }

    await this.item.update(update);
  }
}
