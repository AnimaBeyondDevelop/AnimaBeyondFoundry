import { damageBarrierCheck } from '@module/combat/utils/damageBarrierCheck';
import { damageCheck } from '@module/combat/utils/damageCheck';
import { resistancesEffectCheck } from '@module/combat/utils/resistanceEffectCheck';
import { shieldValueCheck } from '@module/combat/utils/shieldValueCheck';

export function migrateSpellGrades(data) {
  for (let key in data.grades) {
    const grade = data.grades[key];

    if (typeof grade.maintenanceCost.value !== 'number') grade.maintenanceCost.value = 0;

    if (!grade.description.value) continue;
    grade.damage = damageCheck(grade.description.value);
    grade.shieldPoints = shieldValueCheck(grade.description.value);
    grade.damageBarrier = damageBarrierCheck(grade.description.value);
    grade.resistances = resistancesEffectCheck(grade.description.value);
  }
  return data;
}
