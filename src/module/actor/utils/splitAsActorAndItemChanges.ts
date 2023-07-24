export const splitAsActorAndItemChanges = (
  changes: Record<string, unknown>
): [Record<string, unknown>, Record<string, unknown>] => {
  const actorChanges: Record<string, unknown> = {};
  const itemsChanges: Record<string, unknown> = {};

  for (const key of Object.keys(changes)) {
    if (key.includes('.data.')) {
      console.warn(`AnimaBF | Possible old .data. property being used in ${key}`);
    }
    if (key.startsWith('system.dynamic')) {
      if (key.includes('..')) {
        console.warn(`Key ${key} is not valid`);
      }

      itemsChanges[key] = changes[key];
    } else {
      actorChanges[key] = changes[key];
    }
  }

  return [actorChanges, itemsChanges];
};
