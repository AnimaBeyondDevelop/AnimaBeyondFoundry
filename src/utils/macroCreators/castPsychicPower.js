import { castPsychicPowerAtPotential } from '../../module/actor/utils/buttonCallbacks/castPsychicPower.js';
import { createItemMacro } from './createItemMacro.js';

export const id = 'psychicPower.cast';

export default async function createCastPsychicPowerMacro({ actor, item, slot }) {
  return createItemMacro({
    id,
    actor,
    item,
    slot,
    name: `Potencial: ${item.name}`
  });
}

/**
 * @param {object} params
 * @param {Actor} params.actor
 * @param {Item} params.item
 */
export async function executor({ actor, item }) {
  const tokenDoc = actor.getActiveTokens?.()[0]?.document ?? actor.getActiveTokens?.()[0] ?? null;

  await castPsychicPowerAtPotential(actor, {
    powerId: item.id,
    token: tokenDoc
  });

  return true;
}
