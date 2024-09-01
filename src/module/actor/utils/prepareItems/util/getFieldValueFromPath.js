/**
 * @template T
 * @param {import("../../../../types/Actor").ABFActorDataSourceData} data
 * @param {string[]} fieldPath
 * @returns {T}
 */
export const getFieldValueFromPath = (data, fieldPath) => {
  let field = data;

  for (const path of fieldPath) {
    field = field[path];
  }

  return field;
};
