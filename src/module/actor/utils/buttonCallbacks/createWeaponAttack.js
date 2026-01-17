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

  const attackerToken = sheet.token ?? sheet.actor?.getActiveTokens?.()[0];
  if (!attackerToken) return ui.notifications.warn('No attacker token found.');

  const snapshotTargets = getSnapshotTargets();

  new AttackConfigurationDialog(
    { attacker: attackerToken, weaponId, targets: snapshotTargets },
    { allowed: true }
  );

  console.log('Usando arma:', weapon.name);
}
