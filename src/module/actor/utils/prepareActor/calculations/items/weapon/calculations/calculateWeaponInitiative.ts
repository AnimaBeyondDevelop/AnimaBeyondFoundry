import { WeaponDataSource, WeaponSize } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { calculateWeaponInitiativeActionPenalty } from '../util/calculateWeaponInitiativeActionPenalty';

export const calculateWeaponInitiative = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  let initiative =
    data.characteristics.secondaries.initiative.base.value +
    weapon.data.initiative.base.value +
    calculateWeaponInitiativeActionPenalty(data);

  // This depends on the size of the character but right now is not automatized
  if (weapon.data.size.value !== WeaponSize.NORMAL) {
    initiative -= 40;
  }

  return initiative;
};
