import { ABFActorDataSourceData } from '../../../../../../types/Actor';

export const mutateMysticData = (data: ABFActorDataSourceData) => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;

  const { mystic } = data;

  mystic.act.main.final.value = Math.max(mystic.act.main.base.value + allActionsPenalty / 2, 0);

  mystic.act.alternative.final.value = Math.max(mystic.act.alternative.base.value + allActionsPenalty / 2, 0);

  mystic.magicProjection.final.value = Math.max(mystic.magicProjection.base.value + allActionsPenalty, 0);
  mystic.magicProjection.imbalance.offensive.final.value = Math.max(
    mystic.magicProjection.imbalance.offensive.base.value + allActionsPenalty,
    0
  );

  mystic.magicProjection.imbalance.defensive.final.value = Math.max(
    mystic.magicProjection.imbalance.defensive.base.value + allActionsPenalty,
    0
  );

  mystic.zeonRegeneration.final.value = Math.max(mystic.zeonRegeneration.base.value + allActionsPenalty / 2, 0);

  mystic.summoning.summon.final.value = Math.max(mystic.summoning.summon.base.value + allActionsPenalty, 0);
  mystic.summoning.banish.final.value = Math.max(mystic.summoning.banish.base.value + allActionsPenalty, 0);
  mystic.summoning.bind.final.value = Math.max(mystic.summoning.bind.base.value + allActionsPenalty, 0);
  mystic.summoning.control.final.value = Math.max(mystic.summoning.control.base.value + allActionsPenalty, 0);
};
