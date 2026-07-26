import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';
import { ensureResistanceCheck } from '../common/resistanceCheck.js';

/**
 * Initial data for a new invocation (deity).
 * Entity powers are separate Item documents linked via `system.invocationId`.
 * @readonly
 */
export const INITIAL_INVOCATION_DATA = {
  pact: { value: '' },
  description: { value: '' },
  initialInvocationCost: { value: 0 },
  initialInvocationDifficulty: { value: 0 }
};

/** @type {import("../Items").InvocationItemConfig} */
export const InvocationItemConfig = ABFItemConfigFactory({
  type: ABFItems.INVOCATION,
  isInternal: false,
  hasSheet: true,
  defaultValue: INITIAL_INVOCATION_DATA,
  fieldPath: ['mystic', 'invocations'],
  selectors: {
    addItemButtonSelector: 'add-invocation',
    containerSelector: '#invocations-context-menu-container',
    rowSelector: '.invocation-row .invocation-base'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.invocation.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.INVOCATION,
      system: foundry.utils.deepClone(INITIAL_INVOCATION_DATA)
    });
  },
  onDelete: async (actor, target) => {
    const el = target instanceof HTMLElement ? target : target?.[0];
    const itemId =
      el?.closest?.('[data-item-id]')?.dataset?.itemId ?? el?.dataset?.itemId;

    if (!itemId) {
      throw new Error('Data id missing. Are you sure to set data-item-id to rows?');
    }

    const childIds = actor
      .getItemsOf(ABFItems.ENTITY_POWER)
      .filter(power => power.system?.invocationId?.value === itemId)
      .map(power => power.id)
      .filter(Boolean);

    if (childIds.length > 0) {
      await actor.deleteEmbeddedDocuments('Item', childIds);
    }

    await actor.deleteItem(itemId);
  },
  onAttach: async (actor, item) => {
    // Runtime grouping for the actor sheet (not persisted on the invocation).
    item.system.powers = actor
      .getItemsOf(ABFItems.ENTITY_POWER)
      .filter(power => power.system?.invocationId?.value === item.id);
  },
  prepareItem: async item => {
    const enrich =
      foundry.applications?.ux?.TextEditor?.implementation?.enrichHTML ??
      TextEditor.enrichHTML.bind(TextEditor);

    item.system.enrichedPact = await enrich(item.system.pact?.value ?? '', {
      async: true
    });
    item.system.enrichedDescription = await enrich(
      item.system.description?.value ?? '',
      { async: true }
    );

    for (const power of item.system.powers ?? []) {
      power.system.enrichedDescription = await enrich(
        power.system.description?.value ?? power.system.effect?.value ?? '',
        { async: true }
      );
      power.system.enrichedAppearance = await enrich(
        power.system.appearance?.value ?? '',
        { async: true }
      );
      const resistance = ensureResistanceCheck(power.system.resistance, {
        scalable: true
      });
      power.system.resistance = resistance;
      power.system.hasResistanceCheck = resistance.types.length > 0;
    }
  }
});
