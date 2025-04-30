import { calculateAmmoPresence } from './calculations/calculateAmmoPresence';
import { calculateAmmoIntegrity } from './calculations/calculateAmmoIntegrity';
import { calculateAmmoBreaking } from './calculations/calculateAmmoBreaking';
import { calculateAmmoDamage } from './calculations/calculateAmmoDamage';

/**
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateAmmoData = data => {
  /** @type {{ammo: import('../../../../../../types/Items').AmmoDataSource[]}} */
  const combat = data.combat;

  combat.ammo = combat.ammo.map(ammo => {
    ammo.system.damage.final.value = calculateAmmoDamage(ammo);
    ammo.system.presence.final.value = calculateAmmoPresence(ammo);
    ammo.system.integrity.final.value = calculateAmmoIntegrity(ammo);
    ammo.system.breaking.final.value = calculateAmmoBreaking(ammo, data);

    return ammo;
  });
};
