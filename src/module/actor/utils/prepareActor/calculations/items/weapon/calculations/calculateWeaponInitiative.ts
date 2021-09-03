import { WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { calculateWeaponInitiativeActionPenalty } from '../util/calculateWeaponInitiativeActionPenalty';

export const calculateWeaponInitiative = (weapon: WeaponDataSource, data: ABFActorDataSourceData) =>
  data.characteristics.secondaries.initiative.base.value +
  weapon.data.initiative.base.value +
  calculateWeaponInitiativeActionPenalty(data);
