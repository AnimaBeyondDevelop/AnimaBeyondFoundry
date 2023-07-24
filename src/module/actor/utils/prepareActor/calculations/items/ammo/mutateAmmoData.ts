import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { INITIAL_AMMO_DATA } from '../../../../../../types/combat/AmmoItemConfig';
import { calculateAmmoPresence } from './calculations/calculateAmmoPresence';
import { calculateAmmoIntegrity } from './calculations/calculateAmmoIntegrity';
import { calculateAmmoBreaking } from './calculations/calculateAmmoBreaking';
import { calculateAmmoDamage } from './calculations/calculateAmmoDamage';
import { AmmoDataSource } from '../../../../../../types/Items';

export const mutateAmmoData = (data: ABFActorDataSourceData) => {
  const combat = data.combat as { ammo: AmmoDataSource[] };

  combat.ammo = combat.ammo
    .map(ammo => {
      ammo.system = foundry.utils.mergeObject(ammo.system, INITIAL_AMMO_DATA, { overwrite: false });
      return ammo;
    })
    .map(ammo => {
      ammo.system.damage.final.value = calculateAmmoDamage(ammo);
      ammo.system.presence.final.value = calculateAmmoPresence(ammo);
      ammo.system.integrity.final.value = calculateAmmoIntegrity(ammo);
      ammo.system.breaking.final.value = calculateAmmoBreaking(ammo, data);

      return ammo;
    });
};
