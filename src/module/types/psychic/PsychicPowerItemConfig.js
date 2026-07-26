import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { NoneWeaponCritic } from '../combat/WeaponItemConfig.js';
import { ABFItemConfigFactory } from '../ABFItemConfig';
import { createFixedResistanceCheck } from '../common/resistanceCheck.js';

/**
 * @readonly
 * @enum {string}
 */
export const PsychicPowerActionTypes = {
  ACTIVE: 'active',
  PASSIVE: 'passive'
};
/**
 * @readonly
 * @enum {string}
 */
export const PsychicPowerCombatTypes = {
  ATTACK: 'attack',
  DEFENSE: 'defense',
  NONE: 'none'
};
/**
 * @readonly
 * @enum {string}
 */
export const PsychicPowerDisciplines = {
  MATRIX_POWERS: 'matrixPowers',
  TELEPATHY: 'telepathy',
  TELEKINESIS: 'telekenisis',
  PYROKINESIS: 'pyrokinesis',
  CRYOKINESIS: 'cryokinesis',
  PHYSICAL_INCREASE: 'physicalIncrease',
  ENERGY: 'energy',
  TELEMETRY: 'telemetry',
  SENTIENT: 'sentient',
  CAUSALITY: 'causality',
  ELECTROMAGNETISM: 'electromagnetism',
  TELEPORTATION: 'teleportation',
  LIGHT: 'light',
  HYPERSENSITIVITY: 'hypersensitivity'
};

function createInitialPsychicEffect() {
  return {
    value: '',
    damage: { value: 0 },
    fatigue: { value: 0 },
    area: { value: 0 },
    isArea: { value: false },
    shieldPoints: { value: 0 },
    reducedArmor: { value: 0 },
    critBonus: { value: 0 },
    automaticCrit: { value: false },
    affectsInmaterial: { value: false },
    resistanceEffect: createFixedResistanceCheck(0)
  };
}

/**
 * Initial data for a new psychic power. Used to infer the type of the data inside `power.system`
 * @readonly
 */
export const INITIAL_PSYCHIC_POWER_DATA = {
  description: { value: '' },
  level: { value: 0 },
  effects: {
    20: createInitialPsychicEffect(),
    40: createInitialPsychicEffect(),
    80: createInitialPsychicEffect(),
    120: createInitialPsychicEffect(),
    140: createInitialPsychicEffect(),
    180: createInitialPsychicEffect(),
    240: createInitialPsychicEffect(),
    280: createInitialPsychicEffect(),
    320: createInitialPsychicEffect(),
    440: createInitialPsychicEffect()
  },
  actionType: { value: PsychicPowerActionTypes.ACTIVE },
  combatType: { value: PsychicPowerCombatTypes.ATTACK },
  discipline: { value: PsychicPowerDisciplines.MATRIX_POWERS },
  critic: { value: NoneWeaponCritic.NONE },
  hasMaintenance: { value: false },
  visible: false,
  macro: '',
  hotbarMacroCreatorId: 'psychicPower.cast',
  bonus: { value: 0 }
};

/** @type {import("../Items").PsychicPowerItemConfig} */
export const PsychicPowerItemConfig = ABFItemConfigFactory({
  type: ABFItems.PSYCHIC_POWER,
  isInternal: false,
  defaultValue: INITIAL_PSYCHIC_POWER_DATA,
  hasSheet: true,
  fieldPath: ['psychic', 'psychicPowers'],
  selectors: {
    addItemButtonSelector: 'add-psychic-power',
    containerSelector: '#psychic-powers-context-menu-container',
    rowSelector: '.psychic-power-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.psychicPower.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.PSYCHIC_POWER,
      system: INITIAL_PSYCHIC_POWER_DATA
    });
  },
  prepareItem: async psychicPower => {
    psychicPower.system.enrichedDescription = await (foundry.applications?.ux?.TextEditor?.implementation ?? TextEditor).enrichHTML(
      psychicPower.system.description?.value ?? '',
      { async: true }
    );
  }
});
