import type { ActorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import { complementPrimaries } from './utils/complementPrimaries';

export const prepareActor = (data: ActorData): ActorData => {
  data.data.characteristics.primaries = complementPrimaries(
    data.data.characteristics.primaries
  );

  return data;
};
