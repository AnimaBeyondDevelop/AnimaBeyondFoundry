import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { INITIAL_WEAPON_DATA, WeaponShotType, WeaponDataSource } from '../../../../../../types/combat/WeaponItemConfig';
import { calculateWeaponAttack } from './calculations/calculateWeaponAttack';
import { calculateWeaponBlock } from './calculations/calculateWeaponBlock';
import { calculateWeaponDamage } from './calculations/calculateWeaponDamage';
import { calculateWeaponReload } from './calculations/calculateWeaponReload';
import { calculateWeaponIntegrity } from './calculations/calculateWeaponIntegrity';
import { calculateWeaponBreaking } from './calculations/calculateWeaponBreaking';
import { calculateWeaponPresence } from './calculations/calculateWeaponPresence';
import { calculateWeaponRange } from './calculations/calculateWeaponRange';
import { calculateWeaponInitiative } from './calculations/calculateWeaponInitiative';

export const mutateWeaponsData = (data: ABFActorDataSourceData) => {
  const combat = data.combat as { weapons: WeaponDataSource[] };

  combat.weapons = combat.weapons
    .map(weapon => {
      weapon.data = foundry.utils.mergeObject(weapon.data, INITIAL_WEAPON_DATA, { overwrite: false });
      return weapon;
    })
    .map(weapon => {
      weapon.data.attack.final.value = calculateWeaponAttack(weapon, data);
      weapon.data.block.final.value = calculateWeaponBlock(weapon, data);
      weapon.data.initiative.final.value = calculateWeaponInitiative(weapon);
      weapon.data.damage.final.value = calculateWeaponDamage(weapon, data);
      weapon.data.integrity.final.value = calculateWeaponIntegrity(weapon);
      weapon.data.breaking.final.value = calculateWeaponBreaking(weapon, data);
      weapon.data.presence.final.value = calculateWeaponPresence(weapon);

      if (weapon.data.isRanged.value) {
        weapon.data.range.final.value = calculateWeaponRange(weapon, data);

        if (weapon.data.shotType.value === WeaponShotType.SHOT) {
          weapon.data.reload.final.value = calculateWeaponReload(weapon, data);

          if (weapon.data.ammo) {
            weapon.data.critic.primary.value = weapon.data.ammo.data.critic.value;
          }
        }
      }

      return weapon;
    });
};
