import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { WeaponShotType } from '../../../../../../types/combat/WeaponItemConfig';
import { calculateWeaponAttack } from './calculations/calculateWeaponAttack';
import { calculateWeaponBlock } from './calculations/calculateWeaponBlock';
import { calculateWeaponDamage } from './calculations/calculateWeaponDamage';
import { calculateWeaponReload } from './calculations/calculateWeaponReload';
import { calculateWeaponIntegrity } from './calculations/calculateWeaponIntegrity';
import { calculateWeaponBreaking } from './calculations/calculateWeaponBreaking';
import { calculateWeaponPresence } from './calculations/calculateWeaponPresence';
import { calculateWeaponRange } from './calculations/calculateWeaponRange';
import { calculateWeaponInitiative } from './calculations/calculateWeaponInitiative';
import { WeaponDataSource } from '../../../../../../types/Items';

export const mutateWeaponsData = (data: ABFActorDataSourceData) => {
  const combat = data.combat as { weapons: WeaponDataSource[] };

  combat.weapons = combat.weapons.map(weapon => {
    weapon.system.attack = {
      base: weapon.system.attack.base,
      special: weapon.system.attack.special,
      final: { value: calculateWeaponAttack(weapon, data) }
    };

    weapon.system.block = {
      base: weapon.system.block.base,
      special: weapon.system.block.special,
      final: { value: calculateWeaponBlock(weapon, data) }
    };

    weapon.system.initiative = {
      base: weapon.system.initiative.base,
      final: { value: calculateWeaponInitiative(weapon) }
    };

    weapon.system.damage = {
      base: weapon.system.damage.base,
      final: { value: calculateWeaponDamage(weapon, data) }
    };

    weapon.system.integrity = {
      base: weapon.system.integrity.base,
      final: { value: calculateWeaponIntegrity(weapon) }
    };

    weapon.system.breaking = {
      base: weapon.system.breaking.base,
      final: { value: calculateWeaponBreaking(weapon, data) }
    };

    weapon.system.presence = {
      base: weapon.system.presence.base,
      final: { value: calculateWeaponPresence(weapon) }
    };

    if (weapon.system.isRanged.value) {
      weapon.system.range = {
        base: weapon.system.range.base,
        final: { value: calculateWeaponRange(weapon, data) }
      };

      if (weapon.system.shotType.value === WeaponShotType.SHOT) {
        weapon.system.reload = {
          base: weapon.system.reload.base,
          final: { value: calculateWeaponReload(weapon, data) }
        };

        if (weapon.system.ammo) {
          weapon.system.critic.primary.value = weapon.system.ammo.system.critic.value;
        }
      }
    }

    return weapon;
  });
};
