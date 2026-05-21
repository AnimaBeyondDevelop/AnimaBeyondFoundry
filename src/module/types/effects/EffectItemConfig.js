// EffectItemConfig.js
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';
import { findEffectLinkedToItem } from '../../actor/utils/findEffectLinkedToItem.js';

export const INITIAL_EFFECT_DATA = {
  active: false,
  effectData: {
    icon: 'icons/svg/aura.svg',
    disabled: false,
    changes: [],
    duration: {},
    transfer: true,
    flags: {}
  }
};

export const EffectItemConfig = ABFItemConfigFactory({
  type: ABFItems.EFFECT,
  isInternal: false,
  hasSheet: true,
  defaultValue: INITIAL_EFFECT_DATA,

  fieldPath: ['_effectsDummy'],

  selectors: {
    containerSelector: '.effects-list',
    rowSelector: '.item.effect',
    addItemButtonSelector: 'add-effect'
  },

  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('anima.ui.effects.effectsList.newEffectDialog.content')
    });

    if (!name) return;

    const itemData = {
      name,
      type: ABFItems.EFFECT,
      system: {
        ...INITIAL_EFFECT_DATA,
        active: false,
        effectData: {
          ...INITIAL_EFFECT_DATA.effectData,
          disabled: true
        }
      }
    };

    await actor.createItem(itemData);
  },

  onDelete: async (actor, target) => {
    // Foundry exposes the ContextMenu callback target as either a jQuery
    // selector (legacy V13 behaviour) or a raw HTMLElement (V14, also seen
    // in V13 when foundry.applications.ux.ContextMenu.implementation is
    // available). Normalize both shapes; previously `target[0]?.dataset`
    // would silently return undefined under the HTMLElement shape and the
    // delete action did nothing.
    const el = target instanceof HTMLElement ? target : target?.[0];
    const id = el?.dataset?.itemId;
    if (!id) return;

    const item = actor.items.get(id);
    if (!item) return;

    // Effects are transient combat states (Sorpresa, Derribado, Cegueras,
    // Paralisis...) that the GM toggles on and off many times per fight.
    // The cost of an accidental delete is low (re-drag from the compendium
    // takes one drag) and the cost of an extra confirmation dialog per click
    // is high during play. So this onDelete intentionally skips the
    // ABFDialogs.confirm step that the generic delete flow uses for items
    // whose loss is harder to recover (weapons with computed bonuses, etc.).
    const effect = findEffectLinkedToItem(actor, item);

    const ops = [];
    if (effect) {
      ops.push(actor.deleteEmbeddedDocuments('ActiveEffect', [effect.id]));
    }
    ops.push(actor.deleteEmbeddedDocuments('Item', [id]));

    await Promise.all(ops);
  },

  onAttach: async () => {},
  prepareItem: () => {}
});

EffectItemConfig.cleanFieldPath = () => {};
EffectItemConfig.addToFieldPath = () => {};
EffectItemConfig.resetFieldPath = async () => {};
EffectItemConfig.getFromDynamicChanges = () => undefined;
