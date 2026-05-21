import { AttackConfigurationDialog } from '../../../dialogs/AttackConfigurationDialog.js';
import { getSnapshotTargets } from '../getSnapshotTargets.js';

/**
 * Open AttackConfigurationDialog with the selected weapon locked.
 */
export function createWeaponAttack(sheet, e) {
  const weaponId = e.currentTarget.dataset.weaponId;
  if (!weaponId) return ui.notifications.warn('ID de arma no válido.');

  const weapon = sheet.actor?.items?.get(weaponId);
  if (!weapon) return ui.notifications.warn('Arma no encontrada.');

  // Prefer the sheet's token (when the sheet was opened from a token on the
  // canvas) over a generic getActiveTokens lookup. On unlinked tokens the
  // sheet.token already carries the ActorDelta we need to read AE from;
  // grabbing a random active token via the world actor can produce a
  // different one. If neither is available we fall back to the first active
  // token only as a last resort.
  const sheetToken = sheet.token ?? sheet.object?.document ?? null;
  const attackerToken = sheetToken ?? sheet.actor?.getActiveTokens?.()[0] ?? null;
  if (!attackerToken) return ui.notifications.warn('No attacker token found.');

  const snapshotTargets = getSnapshotTargets();

  new AttackConfigurationDialog(
    { attacker: attackerToken, weaponId, targets: snapshotTargets },
    { allowed: true }
  );

  console.log('Usando arma:', weapon.name);
}
