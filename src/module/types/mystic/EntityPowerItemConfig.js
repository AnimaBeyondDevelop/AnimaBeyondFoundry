import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';
import { NoneWeaponCritic } from '../combat/WeaponItemConfig.js';
import { createScalableStat } from './entityPowerScale';
import { createScalableResistanceCheck } from '../common/resistanceCheck.js';

/**
 * @readonly
 * @enum {string}
 */
export const EntityPowerTypes = {
  ATTACK: 'attack',
  DEFENSE: 'defense',
  EFFECT: 'effect'
};

/**
 * @readonly
 * @enum {string}
 */
export const EntityPowerActionTypes = {
  ACTIVE: 'active',
  PASSIVE: 'passive'
};

/**
 * Initial data for a new entity power.
 * Numeric combat stats use `{ value, scale: { amount, per } }` so the sheet
 * can show the base while invocation applies margin scaling.
 * Linked to a deity via `invocationId` when owned by an actor.
 * @readonly
 */
export const INITIAL_ENTITY_POWER_DATA = {
  invocationId: { value: '' },
  difficulty: { value: 0 },
  cost: { value: 0 },
  actionType: { value: EntityPowerActionTypes.ACTIVE },
  powerType: { value: EntityPowerTypes.ATTACK },
  attackAbility: createScalableStat(0),
  defenseAbility: createScalableStat(0),
  damage: createScalableStat(0),
  area: createScalableStat(0),
  isArea: { value: false },
  shieldPoints: createScalableStat(0),
  critic: { value: NoneWeaponCritic.NONE },
  reducedArmor: createScalableStat(0),
  ignoreArmor: { value: false },
  critBonus: createScalableStat(0),
  automaticCrit: { value: false },
  resistance: createScalableResistanceCheck(0),
  description: { value: '' },
  duration: { value: '' },
  appearance: { value: '' },
  hotbarMacroCreatorId: 'entityPower.invoke'
};

/** @type {import("../Items").EntityPowerItemConfig} */
export const EntityPowerItemConfig = ABFItemConfigFactory({
  type: ABFItems.ENTITY_POWER,
  isInternal: false,
  hasSheet: true,
  fieldPath: ['mystic', 'entityPowers'],
  defaultValue: INITIAL_ENTITY_POWER_DATA,
  getFromDynamicChanges: changes => {
    return changes.system.dynamic.entityPower;
  },
  selectors: {
    addItemButtonSelector: 'add-entity-power',
    containerSelector: '#invocations-context-menu-container',
    rowSelector: '.invocation-row .entity-power-row'
  },
  onCreate: async (actor, invocationId) => {
    if (typeof invocationId !== 'string') throw new Error('invocationId missing');

    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.entityPower.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.ENTITY_POWER,
      system: {
        ...foundry.utils.deepClone(INITIAL_ENTITY_POWER_DATA),
        invocationId: { value: invocationId }
      }
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name, system } = changes[id];
      let { invocationId, ...powerSystem } = system ?? {};

      // Sheet hidden field may send a bare string; keep `{ value }`.
      if (typeof invocationId === 'string') {
        powerSystem.invocationId = { value: invocationId };
      } else if (invocationId && typeof invocationId === 'object') {
        powerSystem.invocationId = invocationId;
      }

      await actor.updateItem({
        id,
        name,
        system: powerSystem
      });
    }
  }
});
