// utils/systemMeta.js
export const System = {
  get id() {
    return game.system?.id ?? 'abf';
  },
  get title() {
    return game.system?.title ?? 'Anima Beyond Fantasy';
  },
  get version() {
    return game.system?.version ?? '0.0.0';
  },

  get socketScope() {
    return `system.${this.id}`;
  },
  get flagsScope() {
    return this.id;
  }
};

export function registerSystemOnGame() {
  const id = System.id;

  // Canonical bucket for the system: game[<id>]
  game[id] ??= {};
  const bucket = game[id];

  // Metadata
  bucket.id = id;
  bucket.system = {
    id,
    title: System.title,
    version: System.version,
    socketScope: System.socketScope,
    flagsScope: System.flagsScope
  };

  // If something already put stuff under game.abf, merge it into the canonical bucket
  if (game.abf && game.abf !== bucket) {
    try {
      const src = game.abf;
      for (const k of Object.keys(src)) {
        if (bucket[k] === undefined) bucket[k] = src[k];
      }
    } catch (_) {}
  }

  // Hard alias: ensure game.abf points to the canonical bucket
  game.abf = bucket;
}
