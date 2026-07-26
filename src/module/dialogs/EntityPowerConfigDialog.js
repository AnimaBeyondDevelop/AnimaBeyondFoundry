import { Templates } from '../utils/constants.js';
import { ABFConfig } from '../ABFConfig.js';
import { ABFItems } from '../items/ABFItems.js';
import {
  DEFAULT_ENTITY_POWER_SCALE_PER,
  ENTITY_POWER_SCALABLE_STATS,
  ensureScalableStat
} from '../types/mystic/entityPowerScale.js';
import { EntityPowerActionTypes } from '../types/mystic/EntityPowerItemConfig.js';
import {
  resistanceCheckFromFormData,
  resistanceCheckToFormFields
} from '../types/common/resistanceCheck.js';

/**
 * Editor dialog for an entity power Item document.
 */
export class EntityPowerConfigDialog extends FormApplication {
  /**
   * @param {import('../actor/ABFActor').ABFActor | null} actor
   * @param {{ entityPowerId?: string, item?: Item }} options
   */
  constructor(actor, { entityPowerId, item } = {}) {
    super({}, {});
    this.actor = actor ?? item?.actor ?? null;
    this.entityPowerId = entityPowerId ?? item?.id;
    this._item = item ?? null;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'abf-entity-power-config',
      classes: ['animabf-dialog', 'entity-power-config-dialog'],
      template: Templates.Dialog.EntityPowerConfigDialog,
      width: 540,
      closeOnSubmit: true,
      submitOnChange: false,
      resizable: true
    });
  }

  /** @returns {Item | null} */
  _getPowerItem() {
    if (this._item?.type === ABFItems.ENTITY_POWER) {
      return this._item;
    }
    if (this.actor && this.entityPowerId) {
      return this.actor.items.get(this.entityPowerId) ?? null;
    }
    return null;
  }

  get title() {
    const power = this._getPowerItem();
    return power?.name ?? game.i18n.localize('anima.ui.mystic.invocation.powers.title');
  }

  /**
   * Flatten a scalable stat into dialog template fields.
   * @param {object} system
   * @param {string} key
   */
  _scalableFields(system, key) {
    const { value, scale } = ensureScalableStat(system?.[key]);
    return {
      [key]: value,
      [`${key}ScaleAmount`]: scale.amount,
      [`${key}ScalePer`]: scale.per
    };
  }

  getData() {
    const power = this._getPowerItem();
    const system = power?.system ?? {};
    const powerType = system.powerType?.value ?? '';

    /** @type {Record<string, number>} */
    const scalable = {};
    for (const key of ENTITY_POWER_SCALABLE_STATS) {
      Object.assign(scalable, this._scalableFields(system, key));
    }

    return {
      powerType,
      actionType: system.actionType?.value ?? EntityPowerActionTypes.ACTIVE,
      isAttack: powerType === 'attack',
      isDefense: powerType === 'defense',
      powerTypes: ABFConfig.iterables?.mystic?.entityPowerTypes ?? {},
      actionTypes: ABFConfig.iterables?.mystic?.entityPowerActionTypes ?? {},
      criticTypes: ABFConfig.iterables?.combat?.weapon?.criticTypesWithNone ?? {},
      difficulty: Number(system.difficulty?.value ?? 0) || 0,
      cost: Number(system.cost?.value ?? 0) || 0,
      isArea: !!system.isArea?.value,
      critic: system.critic?.value ?? game.animabf.weapon.NoneWeaponCritic.NONE,
      ignoreArmor: !!system.ignoreArmor?.value,
      automaticCrit: !!system.automaticCrit?.value,
      description: system.description?.value ?? system.effect?.value ?? '',
      duration: system.duration?.value ?? '',
      appearance: system.appearance?.value ?? '',
      ...scalable,
      resistanceFieldPrefix: 'resistance',
      resistanceScalable: true,
      resistanceTypeOptions: ABFConfig.iterables?.resistances ?? {},
      resistanceSelectionModes: ABFConfig.iterables?.resistanceSelectionModes ?? {},
      resistanceApplicationModes: ABFConfig.iterables?.resistanceApplicationModes ?? {},
      ...resistanceCheckToFormFields(system.resistance, {
        prefix: 'resistance',
        scalable: true
      })
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

  /**
   * @param {object} formData
   * @param {string} key
   */
  _readScalableStat(formData, key) {
    const perRaw = Number(formData[`${key}ScalePer`] ?? DEFAULT_ENTITY_POWER_SCALE_PER);
    return {
      value: Number(formData[key] ?? 0) || 0,
      scale: {
        amount: Number(formData[`${key}ScaleAmount`] ?? 0) || 0,
        per: perRaw > 0 ? perRaw : DEFAULT_ENTITY_POWER_SCALE_PER
      }
    };
  }

  async _updateObject(_event, formData) {
    const power = this._getPowerItem();
    if (!power || typeof power.update !== 'function') return;

    const isArea = formData.isArea === 'on' || formData.isArea === true;

    /** @type {Record<string, object>} */
    const scalableSystem = {};
    for (const key of ENTITY_POWER_SCALABLE_STATS) {
      scalableSystem[key] = this._readScalableStat(formData, key);
    }

    await power.update({
      system: {
        difficulty: { value: Number(formData.difficulty ?? 0) || 0 },
        cost: { value: Number(formData.cost ?? 0) || 0 },
        actionType: {
          value: String(formData.actionType ?? EntityPowerActionTypes.ACTIVE)
        },
        powerType: { value: String(formData.powerType ?? '') },
        isArea: { value: isArea },
        critic: {
          value: String(formData.critic ?? game.animabf.weapon.NoneWeaponCritic.NONE)
        },
        ignoreArmor: {
          value: formData.ignoreArmor === 'on' || formData.ignoreArmor === true
        },
        automaticCrit: {
          value: formData.automaticCrit === 'on' || formData.automaticCrit === true
        },
        description: { value: String(formData.description ?? '') },
        duration: { value: String(formData.duration ?? '') },
        appearance: { value: String(formData.appearance ?? '') },
        resistance: resistanceCheckFromFormData(formData, {
          prefix: 'resistance',
          scalable: true
        }),
        ...scalableSystem
      }
    });
  }
}
