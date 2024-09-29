/**
 * @template T
 * @param {import("../../../../types/Actor").ABFActorDataSourceData} data
 * @param {string[]} fieldPath
 * @returns {T}
 */
export const getFieldNodeFromPath = (data, fieldPath) => {
  let field = data;

  for (let i = 0; i < fieldPath.length - 1; i += 1) {
    const path = fieldPath[i];

    field = field[path];
  }

  return field;
};
