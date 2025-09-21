export function getChatVisibilityOptions() {
  const mode = game.settings.get('core', 'rollMode') ?? 'publicroll';
  const vis = { rollMode: mode };
  if (mode === 'gmroll') {
    vis.whisper = ChatMessage.getWhisperRecipients('GM').map(u => u.id);
  } else if (mode === 'blindroll') {
    vis.whisper = ChatMessage.getWhisperRecipients('GM').map(u => u.id);
    vis.blind = true;
  } else if (mode === 'selfroll') {
    vis.whisper = [game.user.id];
  }
  return vis;
}
