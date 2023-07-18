import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
  * @typedef {Object} TechniqueItemData
  * @property {{value: string}} description
  * @property {{value: number}} level
  * @property {{value: number}} strength
  * @property {{value: number}} agility
  * @property {{value: number}} dexterity
  * @property {{value: number}} constitution
  * @property {{value: number}} willPower
  * @property {{value: number}} power
  * @property {{value: number}} martialKnowledge
  */

/**
  * @typedef {import("../Items").ItemChanges<TechniqueItemData>} TechniqueChanges
  */

/**
 * @typedef {import("../../../animabf.types").ABFItemBaseDataSource<ABFItems.TECHNIQUE, TechniqueItemData>} TechniqueDataSource
  */

/** @type {import("../Items").ABFItemConfig<TechniqueDataSource, TechniqueChanges>} */
export const TechniqueItemConfig = ABFItemConfigFactory({
  type: ABFItems.TECHNIQUE,
  isInternal: false,
  fieldPath: ['domine', 'techniques'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.techniques;
  },
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
      system: {
        description: { value: '' },
        level: { value: 0 },
        strength: { value: 0 },
        agility: { value: 0 },
        dexterity: { value: 0 },
        constitution: { value: 0 },
        willPower: { value: 0 },
        power: { value: 0 },
        martialKnowledge: { value: 0 }
      }
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const {
        name,
        data
      } = changes[id];

      await actor.updateItem({
        id,
        name,
        system: data
      });
    }
  },
  onAttach: async (actor, technique) => {
    technique.system.enrichedDescription = await TextEditor.enrichHTML(
      technique.system.description?.value ?? '',
      {
        async: true
      }
    );

    actor.system.domine.techniques = actor.system.domine.techniques.filter(t => t._id !== technique._id);
    actor.system.domine.techniques.push(technique);
  }
});
