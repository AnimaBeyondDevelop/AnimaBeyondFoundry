import { WeaponItemData } from '../../../../types/Items';
import { mutateStrRequired } from './mutations/mutateStrRequired';
import { mutateWeaponStrength } from './mutations/mutateWeaponStrength';

const DERIVED_DATA_FUNCTIONS: ((data: WeaponItemData) => void)[] = [
  mutateStrRequired,
  mutateWeaponStrength
];

export const mutateWeapon = async (item: any) => {
  const { system: data } = item;

  for (const fn of DERIVED_DATA_FUNCTIONS) {
    await fn(data as WeaponItemData);
  }
};
