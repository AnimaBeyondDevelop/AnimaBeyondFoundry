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
import { calculateWeaponArmorReduction } from './calculations/calculateWeaponArmorReduction';
import { calculateArmorReductionFromQuality } from './util/calculateArmorReductionFromQuality';

/**
 *
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateWeaponsData = data => {
  /** @type {{weapons: import('../../../../../../types/Items').WeaponDataSource[]}} */
  const combat = data.combat;

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
      special: weapon.system.initiative.special,
      final: { value: calculateWeaponInitiative(weapon) }
    };

    weapon.system.damage = {
      base: weapon.system.damage.base,
      special: weapon.system.damage.special,
      final: { value: calculateWeaponDamage(weapon, data) },
      formula: weapon.system.damage.formula ?? { value: '' },
      applyQualityInFormula: weapon.system.damage.applyQualityInFormula
    };

    weapon.system.reducedArmor.base.value = calculateArmorReductionFromQuality(weapon);

    weapon.system.reducedArmor = {
      base: weapon.system.reducedArmor.base,
      special: weapon.system.reducedArmor.special,
      final: { value: calculateWeaponArmorReduction(weapon) }
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

mutateWeaponsData.abfFlow = {
  deps: [
    // Whole weapon array is read extensively
    'system.combat.weapons',

    // These helpers use actor data (common patterns in your system)
    'system.general.modifiers.allActions.final.value',
    'system.general.modifiers.physicalActions.final.value',
    'system.general.modifiers.naturalPenalty.final.value',
    'system.general.modifiers.extraDamage.final.value',

    // Common primary stats typically used in weapon calcs
    'system.characteristics.primaries.strength.final.value',
    'system.characteristics.primaries.dexterity.final.value',
    'system.characteristics.primaries.agility.final.value',

    // Initiative interactions
    'system.characteristics.secondaries.initiative.final.value'
  ],
  mods: [
    // All these are written inside each weapon.system.*
    'system.combat.weapons.attack.final.value',
    'system.combat.weapons.block.final.value',
    'system.combat.weapons.initiative.final.value',
    'system.combat.weapons.damage.final.value',
    'system.combat.weapons.reducedArmor.base.value',
    'system.combat.weapons.reducedArmor.final.value',
    'system.combat.weapons.integrity.final.value',
    'system.combat.weapons.breaking.final.value',
    'system.combat.weapons.presence.final.value',
    'system.combat.weapons.range.final.value',
    'system.combat.weapons.reload.final.value',
    'system.combat.weapons.critic.primary.value'
  ]
};
