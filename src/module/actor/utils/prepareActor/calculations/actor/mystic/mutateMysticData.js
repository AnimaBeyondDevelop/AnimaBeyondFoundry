import { roundTo5Multiples } from '../../../../../../combat/utils/roundTo5Multiples';
import { calculateInnateMagic } from './calculations/calculateInnateMagic';

// ── ACT main ─────────────────────────────────────────────────────────────────

export const mutateActMain = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;
  const { mystic } = data;
  mystic.act.main.final.value = Math.max(
    mystic.act.main.base.value + Math.min(0, -roundTo5Multiples(-allActionsPenalty / 2)),
    0
  );
};

mutateActMain.abfFlow = {
  deps: [
    'system.general.modifiers.allActions.final.value',
    'system.mystic.act.main.base.value'
  ],
  mods: ['system.mystic.act.main.final.value']
};

// ── ACT vias ─────────────────────────────────────────────────────────────────

export const mutateActVias = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;
  const { mystic } = data;
  if (mystic.act.via.length !== 0) {
    for (const actVia of mystic.act.via) {
      actVia.system.final.value = Math.max(
        actVia.system.base.value + Math.min(0, -roundTo5Multiples(-allActionsPenalty / 2)),
        0
      );
    }
  }
};

mutateActVias.abfFlow = {
  deps: [
    'system.general.modifiers.allActions.final.value',
    'system.mystic.act.via'
  ],
  mods: ['system.mystic.act.via']
};

// ── Innate Magic main ─────────────────────────────────────────────────────────

export const mutateInnateMagicMain = data => {
  const { mystic } = data;
  mystic.innateMagic.main.final.value =
    mystic.innateMagic.main.base.value +
    calculateInnateMagic(mystic.act.main.final.value);
};

mutateInnateMagicMain.abfFlow = {
  deps: [
    'system.mystic.act.main.final.value',
    'system.mystic.innateMagic.main.base.value'
  ],
  mods: ['system.mystic.innateMagic.main.final.value']
};

// ── Innate Magic vias ─────────────────────────────────────────────────────────

export const mutateInnateMagicVias = data => {
  const { mystic } = data;
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
};

mutateInnateMagicVias.abfFlow = {
  deps: [
    'system.mystic.act.main.final.value',
    'system.mystic.act.via',
    'system.mystic.innateMagic.via'
  ],
  mods: ['system.mystic.innateMagic.via'
  ]
};

// ── Magic projection ──────────────────────────────────────────────────────────

export const mutateMagicProjection = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;
  const { mystic } = data;
  mystic.magicProjection.final.value = Math.max(
    mystic.magicProjection.base.value + allActionsPenalty,
    0
  );
};

mutateMagicProjection.abfFlow = {
  deps: [
    'system.general.modifiers.allActions.final.value',
    'system.mystic.magicProjection.base.value'
  ],
  mods: ['system.mystic.magicProjection.final.value']
};

export const mutateMagicProjectionOffensive = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;
  const { mystic } = data;
  mystic.magicProjection.imbalance.offensive.final.value = Math.max(
    mystic.magicProjection.imbalance.offensive.base.value + allActionsPenalty,
    0
  );
};

mutateMagicProjectionOffensive.abfFlow = {
  deps: [
    'system.general.modifiers.allActions.final.value',
    'system.mystic.magicProjection.imbalance.offensive.base.value'
  ],
  mods: ['system.mystic.magicProjection.imbalance.offensive.final.value']
};

export const mutateMagicProjectionDefensive = data => {
  const allActionsPenalty = data.general.modifiers.allActions.final.value;
  const { mystic } = data;
  mystic.magicProjection.imbalance.defensive.final.value = Math.max(
    mystic.magicProjection.imbalance.defensive.base.value + allActionsPenalty,
    0
  );
};

mutateMagicProjectionDefensive.abfFlow = {
  deps: [
    'system.general.modifiers.allActions.final.value',
    'system.mystic.magicProjection.imbalance.defensive.base.value'
  ],
  mods: ['system.mystic.magicProjection.imbalance.defensive.final.value']
};

// ── Zeon maintenance ──────────────────────────────────────────────────────────

export const mutateZeonMaintenance = data => {
  const { mystic } = data;

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
};

mutateZeonMaintenance.abfFlow = {
  deps: [
    'system.mystic.spellMaintenances',
    'system.mystic.selectedSpells',
    'system.mystic.zeonMaintained.max',
    'system.mystic.zeonRegeneration.base.value'
  ],
  mods: [
    'system.mystic.spellsMaintenanceCost',
    'system.mystic.zeonMaintained.value',
    'system.mystic.zeonRegeneration.final.value'
  ]
};

// ── Summoning ─────────────────────────────────────────────────────────────────

const makeSummoningMutator = key => {
  const fn = data => {
    const allActionsPenalty = data.general.modifiers.allActions.final.value;
    data.mystic.summoning[key].final.value =
      data.mystic.summoning[key].base.value + Math.min(allActionsPenalty, 0);
  };
  fn.abfFlow = {
    deps: [
      'system.general.modifiers.allActions.final.value',
      `system.mystic.summoning.${key}.base.value`
    ],
    mods: [`system.mystic.summoning.${key}.final.value`]
  };
  Object.defineProperty(fn, 'name', { value: `mutateSummoning_${key}` });
  return fn;
};

export const mutateSummoningSummon = makeSummoningMutator('summon');
export const mutateSummoningBanish = makeSummoningMutator('banish');
export const mutateSummoningBind = makeSummoningMutator('bind');
export const mutateSummoningControl = makeSummoningMutator('control');

// ── Prepared spells ───────────────────────────────────────────────────────────

export const mutatePreparedSpells = data => {
  const { mystic } = data;
  if (mystic.preparedSpells.length !== 0) {
    for (let preparedSpell of mystic.preparedSpells) {
      let prepared = preparedSpell.system.prepared.value;
      if (prepared) {
        preparedSpell.system.zeonAcc.value = preparedSpell.system.zeonAcc.max;
      }
    }
  }
};

mutatePreparedSpells.abfFlow = {
  deps: ['system.mystic.preparedSpells'],
  mods: ['system.mystic.preparedSpells']
};

// ── Legacy aggregate (backwards compatibility) ────────────────────────────────

/**
 * @deprecated Use individual mutate* functions instead.
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateMysticData = data => {
  mutateActMain(data);
  mutateActVias(data);
  mutateInnateMagicMain(data);
  mutateInnateMagicVias(data);
  mutateMagicProjection(data);
  mutateMagicProjectionOffensive(data);
  mutateMagicProjectionDefensive(data);
  mutateZeonMaintenance(data);
  mutateSummoningSummon(data);
  mutateSummoningBanish(data);
  mutateSummoningBind(data);
  mutateSummoningControl(data);
  mutatePreparedSpells(data);
};

mutateMysticData.abfFlow = {
  deps: [
    'system.general.modifiers.allActions.final.value',
    'system.mystic.act.main.base.value',
    'system.mystic.act.via',
    'system.mystic.innateMagic.main.base.value',
    'system.mystic.innateMagic.via',
    'system.mystic.magicProjection.base.value',
    'system.mystic.magicProjection.imbalance.offensive.base.value',
    'system.mystic.magicProjection.imbalance.defensive.base.value',
    'system.mystic.spellMaintenances',
    'system.mystic.selectedSpells',
    'system.mystic.zeonMaintained.max',
    'system.mystic.zeonRegeneration.base.value',
    'system.mystic.summoning.summon.base.value',
    'system.mystic.summoning.banish.base.value',
    'system.mystic.summoning.bind.base.value',
    'system.mystic.summoning.control.base.value'
  ],
  mods: [
    'system.mystic.act.main.final.value',
    'system.mystic.act.via',
    'system.mystic.innateMagic.main.final.value',
    'system.mystic.innateMagic.via',
    'system.mystic.magicProjection.final.value',
    'system.mystic.magicProjection.imbalance.offensive.final.value',
    'system.mystic.magicProjection.imbalance.defensive.final.value',
    'system.mystic.spellsMaintenanceCost',
    'system.mystic.zeonMaintained.value',
    'system.mystic.zeonRegeneration.final.value',
    'system.mystic.summoning.summon.final.value',
    'system.mystic.summoning.banish.final.value',
    'system.mystic.summoning.bind.final.value',
    'system.mystic.summoning.control.final.value'
  ]
};
