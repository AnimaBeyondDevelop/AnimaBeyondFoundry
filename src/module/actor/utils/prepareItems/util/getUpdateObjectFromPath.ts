export const getUpdateObjectFromPath = (value: unknown, fieldPath: string[]) => {
  const result = {};

  fieldPath.reduce((prev, curr, index) => {
    if (index === fieldPath.length - 1) {
      // eslint-disable-next-line no-return-assign
      return (prev[curr] = value);
    }

    // eslint-disable-next-line no-return-assign
    return (prev[curr] = {});
  }, result);

  return result;
};
