import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { SpellMaintenanceDataSource } from '../../../../../../types/mystic/SpellMaintenanceItemConfig';

export const mutateMysticData = (data: ABFActorDataSourceData) => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;

  const { mystic } = data;

  mystic.act.main.final.value = Math.max(mystic.act.main.base.value + Math.min(allActionsPenalty / 2, 0), 0);

  mystic.act.alternative.final.value = Math.max(mystic.act.alternative.base.value + Math.min(allActionsPenalty / 2, 0), 0);

  mystic.magicProjection.final.value = Math.max(mystic.magicProjection.base.value + allActionsPenalty, 0);
  mystic.magicProjection.imbalance.offensive.final.value = Math.max(
    mystic.magicProjection.imbalance.offensive.base.value + allActionsPenalty,
    0
  );

  mystic.magicProjection.imbalance.defensive.final.value = Math.max(
    mystic.magicProjection.imbalance.defensive.base.value + allActionsPenalty,
    0
  );

  const dailyZeon = mystic.spellMaintenances.reduce(
    (acc: number, currentValue: SpellMaintenanceDataSource) =>
      acc + currentValue.system.cost.value,
    0
  );
  mystic.zeonRegeneration.final.value = Math.max(mystic.zeonRegeneration.base.value - dailyZeon, 0);

  mystic.summoning.summon.final.value = mystic.summoning.summon.base.value + Math.min(allActionsPenalty, 0);
  mystic.summoning.banish.final.value = mystic.summoning.banish.base.value + Math.min(allActionsPenalty, 0);
  mystic.summoning.bind.final.value = mystic.summoning.bind.base.value + Math.min(allActionsPenalty, 0);
  mystic.summoning.control.final.value = mystic.summoning.control.base.value + Math.min(allActionsPenalty, 0);
};
