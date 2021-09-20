import { ABFActorDataSourceData } from '../../../../types/Actor';
import { WeaponDataSource } from '../../../../types/combat/WeaponItemConfig';

export const getEquippedWeapons = (data: ABFActorDataSourceData): WeaponDataSource[] => {
  const combat = data.combat as { weapons: WeaponDataSource[] };

  return combat.weapons.filter(a => a.data.equipped.value);
};
