import { ABFActorDataSourceData } from '../../../../types/Actor';
import { ArmorDataSource } from '../../../../types/Items';

export const getEquippedArmors = (data: ABFActorDataSourceData): ArmorDataSource[] => {
  const combat = data.combat as { armors: ArmorDataSource[] };

  return combat.armors.filter(a => a.system.equipped.value);
};
