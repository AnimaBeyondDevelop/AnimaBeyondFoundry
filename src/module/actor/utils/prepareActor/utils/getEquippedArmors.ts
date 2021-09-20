import { ABFActorDataSourceData } from '../../../../types/Actor';
import { ArmorDataSource } from '../../../../types/combat/ArmorItemConfig';

export const getEquippedArmors = (data: ABFActorDataSourceData): ArmorDataSource[] => {
  const combat = data.combat as { armors: ArmorDataSource[] };

  return combat.armors.filter(a => a.data.equipped.value);
};
