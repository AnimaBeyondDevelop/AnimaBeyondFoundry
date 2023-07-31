import { ABFActorDataSourceData } from '../../../../types/Actor';
import { WeaponDataSource } from '../../../../types/Items';

export const getEquippedWeapons = (data: ABFActorDataSourceData): WeaponDataSource[] => {
  const combat = data.combat as { weapons: WeaponDataSource[] };

  return combat.weapons.filter(a => a.system.equipped.value);
};
