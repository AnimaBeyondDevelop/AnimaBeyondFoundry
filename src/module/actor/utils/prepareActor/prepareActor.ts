import { getPrimaries } from './utils/getPrimaries';

export const prepareActor = (originalData: Actor.Data): Actor.Data => {
  const newData: Actor.Data = JSON.parse(JSON.stringify(originalData));

  newData.data.characteristics.primaries = getPrimaries(
    newData.data.characteristics.primaries
  );

  return newData;
};
