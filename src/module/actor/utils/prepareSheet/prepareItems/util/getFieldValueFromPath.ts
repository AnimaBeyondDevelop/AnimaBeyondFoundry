import { ABFActorDataSourceData } from '../../../../ABFActor.type';

export const getFieldValueFromPath = <T>(
  data: ABFActorDataSourceData,
  fieldPath: string[]
): T => {
  let field = data;

  for (const path of fieldPath) {
    field = field[path];
  }

  return field as unknown as T;
};
