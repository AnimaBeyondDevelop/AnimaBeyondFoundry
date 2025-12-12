// EffectItemConfig.js
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';
import { ABFDialogs } from '../../dialogs/ABFDialogs';

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
    const id = target[0]?.dataset?.itemId;
    if (!id) return;

    const item = actor.items.get(id);
    if (!item) return;

    ABFDialogs.confirm(
      game.i18n.localize('dialogs.items.delete.title'),
      game.i18n.localize('dialogs.items.delete.body'),
      {
        onConfirm: async () => {
          const effect = actor.effects.find(e => e.origin === item.uuid) ?? null;

          const ops = [];
          if (effect) {
            ops.push(actor.deleteEmbeddedDocuments('ActiveEffect', [effect.id]));
          }
          ops.push(actor.deleteEmbeddedDocuments('Item', [id]));

          await Promise.all(ops);
        }
      }
    );
  },

  onAttach: async () => {},
  prepareItem: () => {}
});

EffectItemConfig.cleanFieldPath = () => {};
EffectItemConfig.addToFieldPath = () => {};
EffectItemConfig.resetFieldPath = async () => {};
EffectItemConfig.getFromDynamicChanges = () => undefined;
