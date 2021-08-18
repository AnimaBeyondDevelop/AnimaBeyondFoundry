import { complementPrimaries } from './utils/complementPrimaries';

import { CharacterData } from '../../ABFActor';

export const prepareActor = (originalData: CharacterData): CharacterData => {
  const newData: CharacterData = JSON.parse(JSON.stringify(originalData));

  newData.data.characteristics.primaries = complementPrimaries(
    newData.data.characteristics.primaries
  );

  return newData;
};
