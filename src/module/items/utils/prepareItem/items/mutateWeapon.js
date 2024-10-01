import ABFItem from '../../../ABFItem';
import { mutateStrRequired } from './mutations/mutateStrRequired';
import { mutateWeaponStrength } from './mutations/mutateWeaponStrength';

/** @typedef {import('../../../../types/Items').WeaponItemData} WeaponItemData */

/** @type {(async (system: WeaponItemData) => void)[]} */
const DERIVED_DATA_FUNCTIONS = [mutateStrRequired, mutateWeaponStrength];

/** @type {(item: ABFItem) => Promise<void>} */
export const mutateWeapon = async item => {
  const { system } = item;

  for (const fn of DERIVED_DATA_FUNCTIONS) {
    await fn(system);
  }
};
