import { ABFActorDataSourceData } from '../../../../types/Actor';

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
