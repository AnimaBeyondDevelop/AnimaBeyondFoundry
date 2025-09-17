export const chatActionHandlers = (() => {
  const actionModules = {
    // ← añade también chatActions
    ...import.meta.glob('./chatActionHandlers/*.js', { eager: true }),
    ...import.meta.glob('./**/chatActionHandlers/*.js', { eager: true }),
    ...import.meta.glob('./chatActions/*.js', { eager: true }),
    ...import.meta.glob('./**/chatActions/*.js', { eager: true })
  };

  /** @type {Record<string, Function>} */
  const registry = {};

  const register = (id, fn, src) => {
    if (!id || typeof fn !== 'function') return;
    if (registry[id]) {
      console.warn(
        `[ABF] chatActionHandlers: override '${id}' from ${registry[id].__src} with ${src}`
      );
    }
    try {
      Object.defineProperty(fn, '__src', { value: src });
    } catch {}
    registry[id] = fn;
  };

  for (const p in actionModules) {
    const mod = actionModules[p];

    // 1) default export + action(s)
    if (typeof mod.default === 'function') {
      const actions = Array.isArray(mod.actions)
        ? mod.actions
        : typeof mod.action === 'string'
        ? [mod.action]
        : null;
      if (actions) actions.forEach(a => register(a, mod.default, `default@${p}`));
    }

    // 2) named export: handlers = { id: fn, ... }
    if (mod.handlers && typeof mod.handlers === 'object') {
      for (const [id, fn] of Object.entries(mod.handlers))
        register(id, fn, `handlers@${p}`);
    }

    // 3) cualquier función exportada con propiedad estática .action = 'id'
    for (const [key, value] of Object.entries(mod)) {
      if (typeof value === 'function' && typeof value.action === 'string') {
        register(value.action, value, `${key}@${p}`);
      }
    }
  }

  console.debug(
    `[ABF] chatActionHandlers loaded (${Object.keys(registry).length})`,
    Object.keys(registry)
  );
  return registry;
})();
