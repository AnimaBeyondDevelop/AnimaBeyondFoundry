import { prepareItems } from '../prepareItems/prepareItems';
import { mutateWeaponsData } from './calculations/items/weapon/mutateWeaponsData';
import { mutatePrimaryModifiers } from './calculations/actor/mutatePrimaryModifiers';
import { mutateTotalArmor } from './calculations/actor/mutateTotalArmor';
import { mutateAmmoData } from './calculations/items/ammo/mutateAmmoData';
import { mutateArmorsData } from './calculations/items/armor/mutateArmorsData';
import { mutateNaturalPenalty } from './calculations/actor/modifiers/mutateNaturalPenalty';
import { mutatePhysicalModifier } from './calculations/actor/modifiers/mutatePhysicalModifier';
import { mutatePerceptionPenalty } from './calculations/actor/modifiers/mutatePerceptionPenalty';
import { mutateAllActionsModifier } from './calculations/actor/modifiers/mutateAllActionsModifier';
import { mutateSecondariesData } from './calculations/actor/secondaries/mutateSecondariesData';
import { mutateCombatData } from './calculations/actor/combat/mutateCombatData';
import { mutateMovementType } from './calculations/actor/general/mutateMovementType';
import { mutateMysticData } from './calculations/actor/mystic/mutateMysticData';
import { mutatePsychicData } from './calculations/actor/psychic/mutatePsychicData';
import { mutateDomineData } from './calculations/actor/domine/mutateDomineData';
import { mutateInitiative } from './calculations/actor/mutateInitiative';
import { mutateRegenerationType } from './calculations/actor/general/mutateRegenerationType';
import { mutatePresence } from './calculations/actor/mutatePresence';
import { mutateTotalLevel } from './calculations/actor/mutateTotalLevel';
import { mutateResistances } from './calculations/actor/mutateResistances';

import { runEffectFlow } from '../effectFow';
import { inflateSystemFromTypeMarkers } from '../../types/inflateSystemFromTypeMarkers';

// Be careful with order of this functions, some derived data functions could be dependent of another
const DERIVED_DATA_FUNCTIONS = [
  mutateTotalLevel,
  mutatePresence,
  mutateResistances,
  // mutatePrimaryModifiers,
  mutateRegenerationType,
  mutateAllActionsModifier,
  mutateArmorsData,
  mutateTotalArmor,
  mutateNaturalPenalty,
  mutatePhysicalModifier,
  mutatePerceptionPenalty,
  mutateCombatData,
  mutateMovementType,
  mutateSecondariesData,
  mutateAmmoData,
  mutateWeaponsData,
  mutateInitiative,
  mutateMysticData,
  mutatePsychicData,
  mutateDomineData
];

export const prepareActor = async actor => {
  if (actor.__abfPreparePromise) {
    await actor.__abfPreparePromise;
  }

  actor.__abfPreparePromise = (async () => {
    // DEBUG PATHS
    // const watchPaths = [
    //   'system.characteristics.secondaries.resistances.magic.special.value'
    // ];

    // dbgDump(actor, `RUN ${runId} BEFORE reset`, watchPaths);

    // 1) reset baseline
    const baselineSystem = foundry.utils.duplicate(actor._source.system);
    foundry.utils.mergeObject(actor.system, baselineSystem, {
      overwrite: true,
      insertKeys: true,
      insertValues: true
    });
    actor.system = inflateSystemFromTypeMarkers(actor.system);

    // 2) preparar items (si tus derivedFns dependen de items)
    await prepareItems(actor);

    // 3) flow (AE + derivedFns)
    await runEffectFlow(actor, { derivedFns: DERIVED_DATA_FUNCTIONS });

    // 4) UI-only derived (AQUÍ VA “LO NUEVO”)
    actor.system.general.description.enriched = await TextEditor.enrichHTML(
      actor.system.general.description.value,
      { async: true }
    );

    for (const key of Object.keys(actor.system.ui.contractibleItems ?? {})) {
      if (typeof actor.system.ui.contractibleItems[key] === 'string') {
        actor.system.ui.contractibleItems[key] =
          actor.system.ui.contractibleItems[key] === 'true';
      }
    }
  })();

  try {
    await actor.__abfPreparePromise;
  } finally {
    actor.__abfPreparePromise = null;
  }
};

function dbgGet(actor, path) {
  return {
    path,
    source: foundry.utils.getProperty(actor._source, path),
    system: foundry.utils.getProperty(actor, path)
  };
}

function dbgDump(actor, label, paths) {
  const rows = paths.map(p => dbgGet(actor, p));
  console.groupCollapsed(`[FLOW][DBG] ${label}`);
  console.table(rows);
  console.groupEnd();
}
