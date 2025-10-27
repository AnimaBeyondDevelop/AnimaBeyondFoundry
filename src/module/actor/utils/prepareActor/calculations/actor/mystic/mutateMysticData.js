import { roundTo5Multiples } from '../../../../../../combat/utils/roundTo5Multiples';
import { calculateInnateMagic } from './calculations/calculateInnateMagic';

/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateMysticData = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;

  const { mystic } = data;

  mystic.act.main.final.value = Math.max(
    mystic.act.main.base.value + Math.min(0, -roundTo5Multiples(-allActionsPenalty / 2)),
    0
  );
  if (mystic.act.via.length !== 0) {
    for (const actVia of mystic.act.via) {
      actVia.system.final.value = Math.max(
        actVia.system.base.value + Math.min(0, -roundTo5Multiples(-allActionsPenalty / 2)),
        0
      );
    }
  }
  mystic.innateMagic.main.final.value =
    mystic.innateMagic.main.base.value +
    calculateInnateMagic(mystic.act.main.final.value);
  if (mystic.innateMagic.via.length !== 0) {
    for (const innateMagicVia of mystic.innateMagic.via) {
      const actVia = mystic.act.via.find(i => i.name == innateMagicVia.name);
      const actViaValue =
        mystic.act.via.length !== 0 && actVia
          ? actVia.system.final.value
          : mystic.act.main.final.value;
      innateMagicVia.system.final.value =
        innateMagicVia.system.base.value + calculateInnateMagic(actViaValue);
    }
  }
  mystic.magicProjection.final.value = Math.max(
    mystic.magicProjection.base.value + allActionsPenalty,
    0
  );
  mystic.magicProjection.imbalance.offensive.final.value = Math.max(
    mystic.magicProjection.imbalance.offensive.base.value +
    allActionsPenalty,
    0
  );

  mystic.magicProjection.imbalance.defensive.final.value = Math.max(
    mystic.magicProjection.imbalance.defensive.base.value +
    allActionsPenalty,
    0
  );

  const dailyZeon = mystic.spellMaintenances.reduce(
    (acc, currentValue) =>
      acc + (Number(currentValue.system.cost.value) || 0),
    0
  );
  
  const perTurnZeon = mystic.selectedSpells.reduce(
    (acc, currentValue) =>
      acc + (Number(currentValue.system.cost.value) || 0),
    0
  );

  mystic.spellsMaintenanceCost = perTurnZeon;

  const manualMaintained = Number(mystic.zeonMaintained?.max) || 0;
  mystic.zeonMaintained.value = perTurnZeon + manualMaintained;
  
  mystic.zeonRegeneration.final.value = Math.max(
    mystic.zeonRegeneration.base.value - dailyZeon,
    0
  );

  mystic.summoning.summon.final.value =
    mystic.summoning.summon.base.value + Math.min(allActionsPenalty, 0);
  mystic.summoning.banish.final.value =
    mystic.summoning.banish.base.value + Math.min(allActionsPenalty, 0);
  mystic.summoning.bind.final.value =
    mystic.summoning.bind.base.value + Math.min(allActionsPenalty, 0);
  mystic.summoning.control.final.value =
    mystic.summoning.control.base.value + Math.min(allActionsPenalty, 0);

  if (mystic.preparedSpells.length !== 0) {
    for (let preparedSpell of mystic.preparedSpells) {
      let prepared = preparedSpell.system.prepared.value;
      if (prepared) {
        preparedSpell.system.zeonAcc.value = preparedSpell.system.zeonAcc.max;
      }
    }
  }
};
