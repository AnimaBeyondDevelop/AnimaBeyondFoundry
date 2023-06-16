export const migrateToV1 = item => {
  const needToBeMigrated = item.flags?.version === undefined;

  if (needToBeMigrated) {
    item.flags = {
      ...item.flags,
      version: 1
    };

    if (!item.system && item.data) {
      item.system = item.data;

      delete item.data;
    }
  }

  return item;
};
