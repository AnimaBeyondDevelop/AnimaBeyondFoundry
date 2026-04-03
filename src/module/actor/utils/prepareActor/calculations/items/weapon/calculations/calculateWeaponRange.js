import { getWeaponRangeFromStrength } from '../util/getWeaponRangeFromStrength';

/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const calculateWeaponRange = (weapon, data) => {
  const actorStrength =
    data.characteristics.primaries.strength.final?.value ??
    data.characteristics.primaries.strength.value ??
    0;

  const rawStrength = Number(
    weapon.system.hasOwnStr.value
      ? weapon.system.weaponStrength.final.value
      : actorStrength
  );

  const quality = Number(weapon.system.quality.value ?? 0);
  const inhuman = !!data.general?.settings?.inhuman?.value;
  const zen = !!data.general?.settings?.zen?.value;
  const hasInhumanOrZen = inhuman || zen;

  let effectiveStrength = rawStrength;

  // Cap por condiciones de la tabla (de mayor a menor para mantener el mayor tramo permitido).
  if (effectiveStrength >= 16 && (!zen || quality < 20)) {
    effectiveStrength = 15;
  }

  if (effectiveStrength >= 14 && (!zen || quality < 15)) {
    effectiveStrength = 13;
  }

  if (effectiveStrength >= 12 && (!hasInhumanOrZen || quality < 10)) {
    effectiveStrength = 11;
  }

  if (effectiveStrength >= 11 && (!hasInhumanOrZen || quality < 5)) {
    effectiveStrength = 10;
  }

  const baseRange = Number(weapon.system.range.base.value ?? 0);
  const rangeFromStrength = getWeaponRangeFromStrength(effectiveStrength);

  if (rangeFromStrength !== undefined) {
    return Math.max(0, baseRange + rangeFromStrength);
  }

  return 0;
};
