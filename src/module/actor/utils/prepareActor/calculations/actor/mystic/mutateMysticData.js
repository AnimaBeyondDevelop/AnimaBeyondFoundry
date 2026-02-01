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
        actVia.system.base.value +
          Math.min(0, -roundTo5Multiples(-allActionsPenalty / 2)),
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
    mystic.magicProjection.imbalance.offensive.base.value + allActionsPenalty,
    0
  );

  mystic.magicProjection.imbalance.defensive.final.value = Math.max(
    mystic.magicProjection.imbalance.defensive.base.value + allActionsPenalty,
    0
  );

  const dailyZeon = mystic.spellMaintenances.reduce(
    (acc, currentValue) => acc + (Number(currentValue.system.cost.value) || 0),
    0
  );

  const perTurnZeon = mystic.selectedSpells.reduce(
    (acc, currentValue) => acc + (Number(currentValue.system.cost.value) || 0),
    0
  );

  mystic.spellsMaintenanceCost = perTurnZeon;

  const manualMaintained = Number(mystic.zeonMaintained?.max) || 0;
  mystic.zeonMaintained.value = perTurnZeon + manualMaintained;

  mystic.zeonRegeneration.final.value = mystic.zeonRegeneration.base.value - dailyZeon;

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

mutateMysticData.abfFlow = {
  deps: [
    // allActionsPenalty
    'system.general.modifiers.allActions.final.value',

    // ACT main + vias
    'system.mystic.act.main.base.value',
    'system.mystic.act.via', // reads via[*].system.base.value and matches by name

    // Innate Magic main + vias
    'system.mystic.innateMagic.main.base.value',
    'system.mystic.innateMagic.via', // reads via[*].system.base.value and matches by name

    // Magic projection base + imbalances base
    'system.mystic.magicProjection.base.value',
    'system.mystic.magicProjection.imbalance.offensive.base.value',
    'system.mystic.magicProjection.imbalance.defensive.base.value',

    // Spell maintenance cost aggregation
    'system.mystic.spellMaintenances', // reads [*].system.cost.value
    'system.mystic.selectedSpells', // reads [*].system.cost.value

    // Manual maintained zeon
    'system.mystic.zeonMaintained.max',

    // Zeon regeneration
    'system.mystic.zeonRegeneration.base.value',

    // Summoning bases
    'system.mystic.summoning.summon.base.value',
    'system.mystic.summoning.banish.base.value',
    'system.mystic.summoning.bind.base.value',
    'system.mystic.summoning.control.base.value'
  ],
  mods: [
    // ACT finals
    'system.mystic.act.main.final.value',
    'system.mystic.act.via', // writes via[*].system.final.value

    // Innate Magic finals
    'system.mystic.innateMagic.main.final.value',
    'system.mystic.innateMagic.via', // writes via[*].system.final.value

    // Magic projection finals
    'system.mystic.magicProjection.final.value',
    'system.mystic.magicProjection.imbalance.offensive.final.value',
    'system.mystic.magicProjection.imbalance.defensive.final.value',

    // Maintenance bookkeeping
    'system.mystic.spellsMaintenanceCost',
    'system.mystic.zeonMaintained.value',

    // Zeon regeneration final
    'system.mystic.zeonRegeneration.final.value',

    // Summoning finals
    'system.mystic.summoning.summon.final.value',
    'system.mystic.summoning.banish.final.value',
    'system.mystic.summoning.bind.final.value',
    'system.mystic.summoning.control.final.value'
  ]
};
