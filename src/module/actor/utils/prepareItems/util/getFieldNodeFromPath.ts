import { ABFActorDataSourceData } from '../../../../types/Actor';

export const getFieldNodeFromPath = <T>(
  data: ABFActorDataSourceData,
  fieldPath: string[]
): T => {
  let field = data;

  for (let i = 0; i < fieldPath.length - 1; i += 1) {
    const path = fieldPath[i];

    field = field[path];
  }

  return field as unknown as T;
};
