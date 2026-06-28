import { ABFItems } from '../module/items/ABFItems.js';

/** @type {Record<string, string>} */
const FALLBACK_BY_TYPE = {
  [ABFItems.WEAPON]: 'weapon.attack',
  [ABFItems.SPELL]: 'spell.cast',
  [ABFItems.PSYCHIC_POWER]: 'psychicPower.cast'
};

/**
 * @param {Item} item
 * @returns {string | null}
 */
export function resolveHotbarMacroCreatorId(item) {
  const id = item.system?.hotbarMacroCreatorId;
  if (id) return id;
  return FALLBACK_BY_TYPE[item.type] ?? null;
}
