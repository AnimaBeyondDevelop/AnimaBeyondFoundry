import { ABFActor } from '../../ABFActor';
import { prepareItems } from '../prepareItems/prepareItems';
import { mutateWeaponsData } from './calculations/items/weapon/mutateWeaponsData';
import { mutatePrimaryModifiers } from './calculations/actor/mutatePrimaryModifiers';
import { mutateTotalArmor } from './calculations/actor/mutateTotalArmor';
import { mutateAmmoData } from './calculations/items/ammo/mutateAmmoData';
import { mutateArmorsData } from './calculations/items/armor/mutateArmorsData';
import { mutateNaturalPenalty } from './calculations/actor/natural-penalty/mutateNaturalPenalty';
import { mutateSecondariesData } from './calculations/actor/secondaries/mutateSecondariesData';
import { mutatePenalties } from './calculations/actor/modifiers/mutatePenalties';
import { mutateCombatData } from './calculations/actor/combat/mutateCombatData';
import { ABFActorDataSourceData } from '../../../types/Actor';
import { mutateMovementType } from './calculations/actor/general/mutateMovementType';
import { mutateMysticData } from './calculations/actor/mystic/mutateMysticData';
import { mutatePsychicData } from './calculations/actor/psychic/mutatePsychicData';
import { mutateInitiative } from './calculations/actor/mutateInitiative';

// Be careful with order of this functions, some derived data functions could be dependent of another
const DERIVED_DATA_FUNCTIONS: ((data: ABFActorDataSourceData) => void)[] = [
  mutatePrimaryModifiers,
  mutateMovementType,
  mutatePenalties,
  mutateCombatData,
  mutateArmorsData,
  mutateTotalArmor,
  mutateNaturalPenalty,
  mutateSecondariesData,
  mutateAmmoData,
  mutateWeaponsData,
  mutateInitiative,
  mutateMysticData,
  mutatePsychicData
];

export const prepareActor = (actor: ABFActor) => {
  prepareItems(actor);

  // We need to parse to boolean because Foundry saves booleans as string
  for (const key of Object.keys(actor.data.data.ui.contractibleItems)) {
    if (typeof actor.data.data.ui.contractibleItems[key] === 'string') {
      actor.data.data.ui.contractibleItems[key] = actor.data.data.ui.contractibleItems[key] === 'true';
    }
  }

  const { data } = actor.data;

  for (const fn of DERIVED_DATA_FUNCTIONS) {
    fn(data);
  }
};
