import { AttackConfigurationDialog } from '../../module/dialogs/AttackConfigurationDialog.js';
import { getSnapshotTargets } from '../../module/actor/utils/getSnapshotTargets.js';
import { createItemMacro } from './createItemMacro.js';

export const id = 'weapon.attack';

/**
 * Creator: called on hotbarDrop. Creates/assigns a macro for this weapon+actor.
 */
export default async function createWeaponAttackMacro({ actor, item, slot }) {
  return createItemMacro({
    id,
    actor,
    item,
    slot,
    name: `Atacar: ${item.name}`
  });
}

/**
 * Executor: called by game.animabf.macros.execute(...)
 */
export async function executor({ actor, item }) {
  // Prefer controlled token of that actor; otherwise first active token.
  const controlled = canvas?.tokens?.controlled?.find(t => t.actor?.uuid === actor.uuid);
  const attackerToken = controlled ?? actor.getActiveTokens?.()[0];
  if (!attackerToken) {
    ui.notifications?.warn?.('No attacker token found.');
    return false;
  }

  const snapshotTargets = getSnapshotTargets();

  new AttackConfigurationDialog(
    { attacker: attackerToken, weaponId: item.id, targets: snapshotTargets },
    { allowed: true }
  );

  return true;
}
