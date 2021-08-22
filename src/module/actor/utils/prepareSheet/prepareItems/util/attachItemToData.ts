import { ABFActorDataSourceData } from '../../../../ABFActor.type';
import { ATTACH_CONFIGURATIONS, AttachConfiguration } from '../constants';
import { getFieldValueFromPath } from './getFieldValueFromPath';
import { getFieldNodeFromPath } from './getFieldNodeFromPath';

export const attachItemToData = (
  item: { type: string; name: string; data: unknown },
  data: ABFActorDataSourceData
) => {
  const configuration: AttachConfiguration = ATTACH_CONFIGURATIONS[item.type];

  if (configuration) {
    const field = getFieldValueFromPath<unknown[]>(data, configuration.fieldPath);

    if (!field) {
      getFieldNodeFromPath<unknown[]>(data, configuration.fieldPath)[
        configuration.fieldPath.length - 1
      ] = [item];
    } else {
      field.push(item);
    }
  }
};
