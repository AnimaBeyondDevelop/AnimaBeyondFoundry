import { damageBarrierCheck } from '@module/combat/utils/damageBarrierCheck';
import { damageCheck } from '@module/combat/utils/damageCheck';
import { psychicFatigueCheck } from '@module/combat/utils/psychicFatigueCheck';
import { resistancesEffectCheck } from '@module/combat/utils/resistanceEffectCheck';
import { shieldValueCheck } from '@module/combat/utils/shieldValueCheck';

export function migratePsychicEffects(data) {
  for (let key in data.effects) {
    const effect = data.effects[key];
    if (!effect.value) continue;
    effect.description = effect.value;
    effect.damage = damageCheck(effect.value);
    effect.fatigue = psychicFatigueCheck(effect.value);
    effect.shieldPoints = shieldValueCheck(effect.value);
    effect.damageBarrier = damageBarrierCheck(effect.value);
    effect.resistances = resistancesEffectCheck(effect.value);
  }
  return data;
}
