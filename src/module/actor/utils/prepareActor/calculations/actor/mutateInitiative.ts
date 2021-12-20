import { ABFActorDataSourceData } from '../../../../../types/Actor';
import { WeaponDataSource, WeaponSize } from '../../../../../types/combat/WeaponItemConfig';

export const mutateInitiative = (data: ABFActorDataSourceData) => {
  const combat = data.combat as { weapons: WeaponDataSource[] };
  const { general } = data;

  const penalty =
    Math.ceil(general.modifiers.allActions.final.value / 2) + general.modifiers.naturalPenalty.byArmors.value;

  const { initiative } = data.characteristics.secondaries;

  initiative.final.value = initiative.base.value + penalty;

  const equippedWeapons = combat.weapons.filter(weapon => weapon.data.equipped.value);

  const firstTwoWeapons = equippedWeapons.filter(weapon => !weapon.data.isShield.value).slice(0, 2);

  const equippedShield = equippedWeapons.find(weapon => weapon.data.isShield.value);

  // We rest 20 because people is used to put as base unarmed initiative
  initiative.final.value -= 20;

  if (equippedShield) {
    if (equippedShield.data.size.value === WeaponSize.SMALL) {
      initiative.final.value -= 15;
    } else if (equippedShield.data.size.value === WeaponSize.MEDIUM) {
      initiative.final.value -= 25;
    } else {
      initiative.final.value -= 40;
    }
  }

  if (firstTwoWeapons.length === 0) {
    initiative.final.value += 20;
  } else if (firstTwoWeapons.length === 1) {
    initiative.final.value += firstTwoWeapons[0].data.initiative.final.value;
  } else if (firstTwoWeapons.length === 2) {
    const leftWeapon = firstTwoWeapons[0].data;
    const rightWeapon = firstTwoWeapons[1].data;

    initiative.final.value += Math.min(leftWeapon.initiative.final.value, rightWeapon.initiative.final.value);

    if (leftWeapon.size.value === rightWeapon.size.value) {
      if (Math.min(leftWeapon.initiative.base.value, rightWeapon.initiative.base.value) < 0) {
        initiative.final.value -= 20;
      } else {
        initiative.final.value -= 10;
      }
    }
  }
};
