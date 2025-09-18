export async function updateAttackTargetsFlag(messageId, entry) {
  const msg = game.messages.get(messageId);
  const tokenKey = entry?.tokenUuid ?? '';
  const actorKey = entry?.actorUuid ?? '';

  const findIndexByKey = (arr, e) => {
    // Prefer token identity if provided
    if (e.tokenUuid) {
      const iTok = arr.findIndex(t => t.tokenUuid === e.tokenUuid);
      if (iTok >= 0) return iTok;
    }
    // Fallback to actor identity ONLY if no tokenUuid in the entry
    if (e.actorUuid && !e.tokenUuid) {
      return arr.findIndex(t => t.actorUuid === e.actorUuid && !t.tokenUuid);
    }
    return -1;
  };

  // If I can update directly (GM or author), do it
  const canDirect =
    game.user.isGM || (msg && (msg.user?.id === game.user.id || msg.isAuthor));

  if (canDirect && msg) {
    const targets = foundry.utils.duplicate(msg.getFlag(game.abf.id, 'targets') ?? []);
    const i = findIndexByKey(targets, entry);
    if (i >= 0) targets[i] = { ...targets[i], ...entry };
    else targets.push(entry);
    await msg.setFlag(game.abf.id, 'targets', targets);
    ui.chat?.updateMessage?.(msg);
    return true;
  }

  // Otherwise, ask the GM via socket
  game.socket.emit('system.abf', {
    op: 'updateAttackTargets',
    messageId,
    entry,
    from: game.user.id
  });
  return false;
}
