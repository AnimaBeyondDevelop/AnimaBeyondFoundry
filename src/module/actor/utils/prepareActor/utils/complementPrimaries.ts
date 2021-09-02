import { ABFActorDataSourceData } from '../../../../types/Actor';

const getModifier = (value: number) => {
  if (value < 4) {
    return value * 10 - 40;
  }

  return (Math.floor((value + 5) / 5) + Math.floor((value + 4) / 5) + Math.floor((value + 2) / 5) - 4) * 5;
};

/**
 * Adds to primary characteristics object without modifiers its modifiers,
 * calculated based on its value
 * @param data
 */
export const complementPrimaries = (data: ABFActorDataSourceData) => {
  const { primaries } = data.characteristics;

  for (const primaryKey of Object.keys(primaries)) {
    primaries[primaryKey] = {
      value: primaries[primaryKey].value,
      mod: getModifier(primaries[primaryKey].value)
    };
  }
};
