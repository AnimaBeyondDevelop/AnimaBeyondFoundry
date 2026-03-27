import { System } from '../systemMeta.js';
import { createWeaponAttack } from '../../module/actor/utils/buttonCallbacks/createWeaponAttack';
import { AttackConfigurationDialog } from '../../module/dialogs/AttackConfigurationDialog.js';
import { getSnapshotTargets } from '../../module/actor/utils/getSnapshotTargets.js';

export const id = 'weapon.attack';

/**
 * Creator: called on hotbarDrop. Creates/assigns a macro for this weapon+actor.
 */
export default async function createWeaponAttackMacro({ actor, item, slot }) {
  const actorUuid = actor.uuid;
  const itemUuid = item.uuid;

  const payload = { id, actorUuid, itemUuid };
  const command = `await game.animabf.macros.execute(${JSON.stringify(payload)});`;

  let macro = game.macros?.find(
    m =>
      m.getFlag(System.id, 'kind') === id &&
      m.getFlag(System.id, 'actorUuid') === actorUuid &&
      m.getFlag(System.id, 'itemUuid') === itemUuid
  );

  if (!macro) {
    macro = await Macro.create(
      {
        name: `Atacar: ${item.name}`,
        type: 'script',
        img: item.img,
        command,
        flags: {
          [System.id]: { kind: id, actorUuid, itemUuid }
        }
      },
      { displaySheet: false }
    );
  }

  await game.user?.assignHotbarMacro(macro, slot);
  return true;
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
