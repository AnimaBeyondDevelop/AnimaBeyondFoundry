import { complementPrimaries } from './utils/complementPrimaries';

export const prepareActor = (originalData: Actor.Data): Actor.Data => {
  const newData: Actor.Data = JSON.parse(JSON.stringify(originalData));

  newData.data.characteristics.primaries = complementPrimaries(
    newData.data.characteristics.primaries
  );

  return newData;
};
