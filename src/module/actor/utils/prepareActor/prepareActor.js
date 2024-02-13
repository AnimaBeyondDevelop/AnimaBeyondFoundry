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

// Be careful with order of this functions, some derived data functions could be dependent of another
const DERIVED_DATA_FUNCTIONS = [
  mutatePrimaryModifiers,
  mutateMovementType,
  mutateRegenerationType,
  mutateAllActionsModifier,
  mutateCombatData,
  mutateArmorsData,
  mutateTotalArmor,
  mutateNaturalPenalty,
  mutatePhysicalModifier,
  mutatePerceptionPenalty,
  mutateSecondariesData,
  mutateAmmoData,
  mutateWeaponsData,
  mutateInitiative,
  mutateMysticData,
  mutatePsychicData,
  mutateDomineData
];

export const prepareActor = async actor => {
  await prepareItems(actor);

  actor.system.general.description.enriched = await TextEditor.enrichHTML(
    actor.system.general.description.value,
    { async: true }
  );

  // We need to parse to boolean because Foundry saves booleans as string
  for (const key of Object.keys(actor.system.ui.contractibleItems)) {
    if (typeof actor.system.ui.contractibleItems[key] === 'string') {
      actor.system.ui.contractibleItems[key] =
        actor.system.ui.contractibleItems[key] === 'true';
    }
  }

  const { system } = actor;

  for (const fn of DERIVED_DATA_FUNCTIONS) {
    await fn(system);
  }
};
