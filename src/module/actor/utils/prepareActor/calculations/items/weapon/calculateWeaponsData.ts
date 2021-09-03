import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { ShotType, WeaponDataSource } from '../../../../../../types/combat/WeaponItemConfig';
import { calculateWeaponAttack } from './calculations/calculateWeaponAttack';
import { calculateWeaponBlock } from './calculations/calculateWeaponBlock';
import { calculateWeaponInitiative } from './calculations/calculateWeaponInitiative';
import { calculateWeaponDamage } from './calculations/calculateWeaponDamage';
import { calculateWeaponReload } from './calculations/calculateWeaponReload';
import { calculateWeaponIntegrity } from './calculations/calculateWeaponIntegrity';
import { calculateWeaponBreaking } from './calculations/calculateWeaponBreaking';
import { calculateWeaponPresence } from './calculations/calculateWeaponPresence';
import { calculateWeaponRange } from './calculations/calculateWeaponRange';

export const calculateWeaponsData = (data: ABFActorDataSourceData) => {
  const combat = data.combat as { weapons: WeaponDataSource[] };

  combat.weapons = combat.weapons.map(weapon => {
    weapon.data.attack.value = calculateWeaponAttack(weapon, data);
    weapon.data.block.value = calculateWeaponBlock(weapon, data);
    weapon.data.initiative.final.value = calculateWeaponInitiative(weapon, data);
    weapon.data.damage.final.value = Math.max(calculateWeaponDamage(weapon, data), 0);
    weapon.data.integrity.final.value = calculateWeaponIntegrity(weapon);
    weapon.data.breaking.final.value = calculateWeaponBreaking(weapon, data);
    weapon.data.presence.final.value = calculateWeaponPresence(weapon);

    if (weapon.data.isRanged.value) {
      weapon.data.range.final.value = calculateWeaponRange(weapon, data);

      if (weapon.data.shotType.value === ShotType.SHOT) {
        weapon.data.reload.final.value = calculateWeaponReload(weapon, data);

        if (weapon.data.ammo) {
          weapon.data.critic.primary.value = weapon.data.ammo.data.critic.value;
        }
      }
    }

    return weapon;
  });
};
