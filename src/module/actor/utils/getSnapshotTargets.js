export function getSnapshotTargets(user = game.user) {
  return Array.from(user?.targets ?? [])
    .map(t => {
      const tok = t?.document ?? t;

      const actorUuid = tok?.actor?.id ?? tok?.actorId ?? '';
      // Prefer UUID; fallback to id
      const tokenUuid = tok?.uuid ?? tok?.document?.uuid ?? tok?.id ?? '';
      const label = tok?.name ?? tok?.actor?.name ?? '';

      return actorUuid && tokenUuid
        ? { actorUuid, tokenUuid, state: 'pending', label, updatedAt: Date.now() }
        : null;
    })
    .filter(Boolean);
}
