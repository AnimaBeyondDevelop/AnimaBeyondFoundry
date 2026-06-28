import { castSpellAtGrade, openSpellGradeDialog } from '../../module/actor/utils/buttonCallbacks/castSpellGrade.js';
import { createItemMacro } from './createItemMacro.js';

export const id = 'spell.cast';

export default async function createCastSpellMacro({ actor, item, slot }) {
  return createItemMacro({
    id,
    actor,
    item,
    slot,
    name: `Conjurar: ${item.name}`
  });
}

/**
 * @param {object} params
 * @param {Actor} params.actor
 * @param {Item} params.item
 */
export async function executor({ actor, item }) {
  const { grade, cancelled } = await openSpellGradeDialog();
  if (cancelled || !grade) return false;

  const tokenDoc = actor.getActiveTokens?.()[0]?.document ?? actor.getActiveTokens?.()[0] ?? null;

  await castSpellAtGrade(actor, {
    spellId: item.id,
    grade,
    token: tokenDoc,
    useDialog: false
  });

  return true;
}
