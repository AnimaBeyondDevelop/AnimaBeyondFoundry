import { createDefaultWeaponAttack } from "./buttonCallbacks/createDefaultWeaponAttack";
import { createWeaponAttack } from "./buttonCallbacks/createWeaponAttack";


export function createClickHandlers(sheet) {
  return {
    createWeaponAttack: e => createWeaponAttack(sheet, e),
    createDefaultWeaponAttack: e => createDefaultWeaponAttack(sheet, e)
  };
}