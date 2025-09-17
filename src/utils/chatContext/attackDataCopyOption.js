// utils/chatContext/attackDataCopy.js
export default function attackDataCopyOption() {
  return {
    name: "Copy Attack Data",
    icon: '<i class="fas fa-clipboard"></i>',
    // Show only if message was produced by ABFAttackData
    condition: (li) => {
      // Accept HTMLElement or jQuery
      const el = li instanceof HTMLElement ? li : li[0];
      const id = el?.closest("li.chat-message")?.dataset.messageId;
      const msg = id && game.messages.get(id);
      return msg?.getFlag("abf", "kind") === "attackData"
          && !!msg.getFlag("abf", "attackData");
    },
    // Copy JSON from flags (with fallback)
    callback: async (target) => {
      const id = target.closest("li.chat-message")?.dataset.messageId;
      const data = id && game.messages.get(id)?.getFlag("abf", "attackData");
      if (!data) return ui.notifications.warn("No attackData flag found.");
      const json = JSON.stringify(data, null, 2);
      try { await navigator.clipboard.writeText(json); }
      catch {
        const ta = document.createElement("textarea");
        ta.value = json; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.focus(); ta.select();
        document.execCommand("copy"); ta.remove();
      }
      ui.notifications.info("attackData copiado.");
    }
  };
}
