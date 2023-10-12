import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { SecondaryData } from '../../../../../../types/Items';
import { calculateSecondaryStealth } from './calculations/calculateSecondaryStealth';
import { calculateSecondarySwim } from './calculations/calculateSecondarySwim';

const SECONDARIES_AFFECTED_BY_NATURAL_PENALTIES = ['acrobatics', 'athleticism', 'climb', 'jump', 'dance', 'hide', 'featsOfStrength'];
const ATTRIBUTES_AFFECTED_BY_PHYSICAL_PENALTIES = ['agility', 'dexterity', 'strength', 'constitution'];
const SECONDARIES_AFFECTED_BY_PERCEPTION_PENALTIES = ['search', 'notice'];

export const mutateSecondariesData = (data: ABFActorDataSourceData) => {
  const { secondaries } = data;

  for (const rawSecondaryKey of Object.keys(secondaries)) {
    const secondaryKey = rawSecondaryKey as keyof ABFActorDataSourceData['secondaries'];

    if (secondaryKey === 'secondarySpecialSkills') continue;

    for (const key of Object.keys(secondaries[secondaryKey])) {
      const secondary = data.secondaries[secondaryKey][key] as SecondaryData;

      if (key === 'stealth') {
        secondary.final.value = calculateSecondaryStealth(data);
      } else if (key === 'swim') {
        secondary.final.value = calculateSecondarySwim(data);
      } else {
        secondary.final.value = secondary.base.value + data.general.modifiers.allActions.final.value;

        if (SECONDARIES_AFFECTED_BY_NATURAL_PENALTIES.includes(key)) {
          secondary.final.value += data.general.modifiers.naturalPenalty.final.value;
        }

        if (SECONDARIES_AFFECTED_BY_PERCEPTION_PENALTIES.includes(key)) {
          secondary.final.value += data.general.modifiers.perceptionPenalty.final.value;
        }

        if (ATTRIBUTES_AFFECTED_BY_PHYSICAL_PENALTIES.includes(secondary.attribute.value)) {
          secondary.final.value += data.general.modifiers.physicalActions.final.value;
        }
      }
    }
  }
};
