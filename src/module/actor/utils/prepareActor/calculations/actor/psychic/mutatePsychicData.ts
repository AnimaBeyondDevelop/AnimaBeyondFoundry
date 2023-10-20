import { ABFActorDataSourceData } from '../../../../../../types/Actor';

export const mutatePsychicData = (data: ABFActorDataSourceData) => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;
  const projectionMod = data.general.modifiers.projectionMod.value;

  const { psychic } = data;

  psychic.psychicProjection.final.value = Math.max(
    psychic.psychicProjection.base.value + allActionsPenalty + projectionMod,
    0
  );
  psychic.psychicProjection.imbalance.offensive.final.value = Math.max(
    psychic.psychicProjection.imbalance.offensive.base.value +
      allActionsPenalty +
      projectionMod,
    0
  );
  psychic.psychicProjection.imbalance.defensive.final.value = Math.max(
    psychic.psychicProjection.imbalance.defensive.base.value +
      allActionsPenalty +
      projectionMod,
    0
  );

  psychic.psychicPotential.final.value = Math.max(
    psychic.psychicPotential.base.value + Math.min(allActionsPenalty, 0),
    0
  );
  
  if (psychic.psychicShields.length !== 0) {
    for (let psychicShield of psychic.psychicShields) {
      const { shieldPoints } = psychicShield.system;
      if (shieldPoints.maintainMax >= shieldPoints.value) {
        psychicShield.system.maintain.value = true;
      } else {
        psychicShield.system.maintain.value = false;
      }
    }
  }
};
