import { calculateSecondaryStealth } from './calculations/calculateSecondaryStealth';
import { calculateSecondarySwim } from './calculations/calculateSecondarySwim';

const SECONDARIES_AFFECTED_BY_NATURAL_PENALTIES = [
  'acrobatics',
  'athleticism',
  'climb',
  'jump',
  'dance',
  'hide',
  'featsOfStrength'
];
const ATTRIBUTES_AFFECTED_BY_PHYSICAL_PENALTIES = [
  'agility',
  'dexterity',
  'strength',
  'constitution'
];
const SECONDARIES_AFFECTED_BY_PERCEPTION_PENALTIES = ['search', 'notice'];

/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateSecondariesData = data => {
  const { secondaries } = data;

  for (const rawSecondaryKey of Object.keys(secondaries)) {
    /** @type {keyof import('../../../../../../types/Actor').ABFActorDataSourceData['secondaries']} */
    const secondaryKey = rawSecondaryKey;

    if (secondaryKey === 'secondarySpecialSkills') continue;

    for (const key of Object.keys(secondaries[secondaryKey])) {
      /** @type {import('../../../../../../types/Items').SecondaryData} */
      const secondary = data.secondaries[secondaryKey][key];

      if (key === 'stealth') {
        secondary.final.value = calculateSecondaryStealth(data);
      } else if (key === 'swim') {
        secondary.final.value = calculateSecondarySwim(data);
      } else {
        secondary.final.value =
          secondary.base.value + data.general.modifiers.allActions.final.value;

        if (SECONDARIES_AFFECTED_BY_NATURAL_PENALTIES.includes(key)) {
          secondary.final.value += data.general.modifiers.naturalPenalty.final.value;
        }

        if (SECONDARIES_AFFECTED_BY_PERCEPTION_PENALTIES.includes(key)) {
          secondary.final.value += data.general.modifiers.perceptionPenalty.final.value;
        }

        if (
          ATTRIBUTES_AFFECTED_BY_PHYSICAL_PENALTIES.includes(secondary.attribute.value)
        ) {
          secondary.final.value += data.general.modifiers.physicalActions.final.value;
        }
      }
    }
  }
};
