import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * @readonly
 * @enum {string}
 */
export const CombatVisibility = {
  ATTACK: 'attack',
  DEFENSE: 'defense',
  COUNTER_ATTACK: 'counterAttack'
};

/**
 * @readonly
 * @enum {string}
 */
export const SustenanceTypes = {
  NONE: 'none',
  LESSER: 'lesser',
  GREATER: 'greater'
};

/**
 * Initial data for a new technique. Used to infer the type of the data inside `technique.system`
 * @readonly
 */
export const INITIAL_TECHNIQUE_DATA = {
  description: { value: '' },
  level: { value: 0 },
  strength: { value: 0 },
  agility: { value: 0 },
  dexterity: { value: 0 },
  constitution: { value: 0 },
  willPower: { value: 0 },
  power: { value: 0 },
  martialKnowledge: { value: 0 },
  maintenance: { value: false, cost: 0 },
  sustenance: { value: SustenanceTypes.NONE },
  combatVisibility: [CombatVisibility.ATTACK],
  activeEffect: { hasEffects: false, enabled: false }
};

/** @type {import("../Items").TechniqueItemConfig} */
export const TechniqueItemConfig = ABFItemConfigFactory({
  type: ABFItems.TECHNIQUE,
  isInternal: false,
  defaultValue: INITIAL_TECHNIQUE_DATA,
  hasSheet: true,
  fieldPath: ['domine', 'techniques'],
  selectors: {
    addItemButtonSelector: 'add-technique',
    containerSelector: '#techniques-context-menu-container',
    rowSelector: '.technique-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.technique.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.TECHNIQUE,
      system: INITIAL_TECHNIQUE_DATA
    });
  },
  // TODO: This should go inside prepareItem, as in spellItemConfig. Same for other TextEditors
  // That it's called also when opening the standalone sheet.
  prepareItem: async technique => {
    technique.system.enrichedDescription = await TextEditor.enrichHTML(
      technique.system.description?.value ?? '',
      { async: true }
    );
  }
});
