import { INITIAL_WEAPON_DATA, WeaponItemData } from '../../../../types/combat/WeaponItemConfig';
import ABFItem from '../../../ABFItem';
import { mutateStrRequired } from './mutations/mutateStrRequired';
import { mutateWeaponStrength } from './mutations/mutateWeaponStrength';

const DERIVED_DATA_FUNCTIONS: ((data: WeaponItemData) => void)[] = [mutateStrRequired, mutateWeaponStrength];

export const mutateWeapon = (item: ABFItem) => {
  item.data.data = foundry.utils.mergeObject(item.data.data, INITIAL_WEAPON_DATA, { overwrite: false });

  const { data } = item.data;

  for (const fn of DERIVED_DATA_FUNCTIONS) {
    fn(data as WeaponItemData);
  }
};
