export const splitAsActorAndItemChanges = (
  changes: Record<string, unknown>
): [Record<string, unknown>, Record<string, unknown>] => {
  const actorChanges: Record<string, unknown> = {};
  const itemsChanges: Record<string, unknown> = {};

  for (const key of Object.keys(changes)) {
    if (key.startsWith('data.dynamic')) {
      itemsChanges[key] = changes[key];
    } else {
      actorChanges[key] = changes[key];
    }
  }

  return [actorChanges, itemsChanges];
};
