export const normalizeItem = (item, initialData) => {
  const normalizedData = foundry.utils.mergeObject(item.system, initialData, {
    overwrite: false
  });

  item.system = normalizedData;

  return item;
};
