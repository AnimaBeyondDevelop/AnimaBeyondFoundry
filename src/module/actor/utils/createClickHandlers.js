// module/actor/utils/createClickHandlers.js
// Auto-register & cache all click handlers under ./buttonCallbacks

// Eager import = cache en módulo (una sola vez)
const modules = {
  ...import.meta.glob('./buttonCallbacks/*.js', { eager: true }),
  ...import.meta.glob('./buttonCallbacks/**/*.js', { eager: true })
};

/** @type {Record<string, Function>} */
const registry = {};

const register = (id, fn, src) => {
  if (!id || typeof fn !== 'function') return;
  if (registry[id])
    console.warn(
      `[ABF] clickHandlers: overriding '${id}' from ${registry[id].__src} with ${src}`
    );
  try {
    Object.defineProperty(fn, '__src', { value: src });
  } catch {}
  registry[id] = fn;
};

const inferIdFromPath = p => p.match(/([^/]+)\.js$/)?.[1] ?? null;

// Construye el registro (una vez)
for (const p in modules) {
  const mod = modules[p];

  // 1) default export con actions/action
  if (typeof mod.default === 'function') {
    const actions = Array.isArray(mod.actions)
      ? mod.actions
      : typeof mod.action === 'string'
      ? [mod.action]
      : null;
    if (actions?.length) actions.forEach(a => register(a, mod.default, `default@${p}`));
    else register(inferIdFromPath(p), mod.default, `default(inferred)@${p}`);
  }

  // 2) objeto { handlers: { id: fn } }
  if (mod.handlers && typeof mod.handlers === 'object') {
    for (const [id, fn] of Object.entries(mod.handlers))
      register(id, fn, `handlers@${p}`);
  }

  // 3) funciones con propiedad estática .action = 'id'
  for (const [key, value] of Object.entries(mod)) {
    if (typeof value === 'function' && typeof value.action === 'string') {
      register(value.action, value, `${key}@${p}`);
    }
  }

  // 4) fallback: exportaciones con nombre => id = nombre de export
  for (const [key, value] of Object.entries(mod)) {
    if (typeof value === 'function' && key !== 'default')
      register(key, value, `${key}@${p}`);
  }
}

console.debug(
  `[ABF] clickHandlers loaded (${Object.keys(registry).length})`,
  Object.keys(registry)
);

export const clickHandlerRegistry = registry;
export function preloadClickHandlers() {
  return Object.keys(registry).length;
}
// Sustituye solo la parte del export createClickHandlers
export function createClickHandlers(sheet) {
  const bound = {};
  for (const [id, fn] of Object.entries(registry)) {
    bound[id] = e => {
      try {
        // Pass sheet, event, dataset (compatible con tus handlers actuales)
        return fn(sheet, e, e?.currentTarget?.dataset ?? {});
      } catch (err) {
        console.error(`[ABF] clickHandler '${id}' failed from ${fn.__src}`, {
          dataset: e?.currentTarget?.dataset ?? null,
          target: e?.currentTarget ?? null
        });
        ui.notifications?.error(`Handler "${id}" falló (ver consola).`);
        throw err; // deja que Foundry pinte el stack real
      }
    };
  }
  return bound;
}
