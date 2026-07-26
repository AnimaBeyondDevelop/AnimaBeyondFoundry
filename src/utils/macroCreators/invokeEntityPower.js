import { invokeEntityPowerAt } from '../../module/actor/utils/buttonCallbacks/invokeEntityPower.js';
import { createItemMacro } from './createItemMacro.js';

export const id = 'entityPower.invoke';

export default async function createInvokeEntityPowerMacro({ actor, item, slot }) {
  return createItemMacro({
    id,
    actor,
    item,
    slot,
    name: `Invocar: ${item.name}`
  });
}

/**
 * @param {object} params
 * @param {Actor} params.actor
 * @param {Item} params.item
 */
export async function executor({ actor, item }) {
  const invocationId = item.system?.invocationId?.value;
  if (!invocationId) {
    ui.notifications?.warn?.(
      game.i18n.localize('anima.ui.mystic.entityPower.invoke.missingInvocation')
    );
    return false;
  }

  const useRitualDialog = !!game.keyboard?.isModifierActive?.('Shift');

  await invokeEntityPowerAt(actor, {
    invocationId,
    entityPowerId: item.id,
    useRitualDialog
  });

  return true;
}
