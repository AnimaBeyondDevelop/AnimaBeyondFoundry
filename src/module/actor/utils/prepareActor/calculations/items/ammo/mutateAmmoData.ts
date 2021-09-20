import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { AmmoDataSource, INITIAL_AMMO_DATA } from '../../../../../../types/combat/AmmoItemConfig';
import { calculateAmmoPresence } from './calculations/calculateAmmoPresence';
import { calculateAmmoIntegrity } from './calculations/calculateAmmoIntegrity';
import { calculateAmmoBreaking } from './calculations/calculateAmmoBreaking';
import { calculateAmmoDamage } from './calculations/calculateAmmoDamage';

export const mutateAmmoData = (data: ABFActorDataSourceData) => {
  const combat = data.combat as { ammo: AmmoDataSource[] };

  combat.ammo = combat.ammo
    .map(ammo => {
      ammo.data = foundry.utils.mergeObject(ammo.data, INITIAL_AMMO_DATA, { overwrite: false });
      return ammo;
    })
    .map(ammo => {
      ammo.data.damage.final.value = calculateAmmoDamage(ammo);
      ammo.data.presence.final.value = calculateAmmoPresence(ammo);
      ammo.data.integrity.final.value = calculateAmmoIntegrity(ammo);
      ammo.data.breaking.final.value = calculateAmmoBreaking(ammo, data);

      return ammo;
    });
};
