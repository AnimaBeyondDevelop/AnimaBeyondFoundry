// utils/handlebars-helpers/registerHelpers.js

/**
 * Auto-register all Handlebars helpers found under ./helpers
 * Supported export forms per module:
 *  1) export const myHelper = { name: 'xyz', fn: () => {} }
 *  2) export default { name: 'xyz', fn: () => {} }
 *  3) export default function myHelper(...) {}   // uses fn.name
 *     myHelper.hbsName = 'xyz'                  // optional override
 *  4) export const helpers = [ {name, fn}, ... ]
 *  5) export function foo(){...}; foo.actionName='xyz'  // will use foo.name unless hbsName set
 */
export const registerHelpers = () => {
  // Eager import of every helper module under ./helpers and subfolders
  const helperModules = {
    ...import.meta.glob('./helpers/*.js', { eager: true }),
    ...import.meta.glob('./helpers/**/*.js', { eager: true })
  };

  /** Track what we registered to warn on overrides */
  const registry = Object.create(null);

  const register = (name, fn, src) => {
    if (!name || typeof fn !== 'function') return;
    if (registry[name]) {
      console.warn(
        `[ABF] handlebars helper override: '${name}' from ${registry[name]} -> ${src}`
      );
    }
    Handlebars.registerHelper(name, fn);
    registry[name] = src;
  };

  const acceptCandidate = (candidate, src) => {
    if (!candidate) return;

    // Form 2/1 — object with {name, fn}
    if (typeof candidate === 'object' && !Array.isArray(candidate)) {
      // If it has "helpers" array inside, register them
      if (Array.isArray(candidate.helpers)) {
        for (const h of candidate.helpers) acceptCandidate(h, `${src}#helpers[]`);
      }
      // The canonical object shape
      if (typeof candidate.name === 'string' && typeof candidate.fn === 'function') {
        return register(candidate.name, candidate.fn, src);
      }
      return; // ignore other plain objects
    }

    // Form 3 — function export (optionally with .hbsName to override)
    if (typeof candidate === 'function') {
      const name = candidate.hbsName || candidate.name;
      return register(name, candidate, src);
    }

    // Form array (just in case someone exports an array of {name, fn})
    if (Array.isArray(candidate)) {
      for (const h of candidate) acceptCandidate(h, `${src}[]`);
    }
  };

  // Iterate every module and try default + named exports
  for (const path in helperModules) {
    const mod = helperModules[path];
    if (!mod) continue;

    if (mod.default) acceptCandidate(mod.default, `default@${path}`);
    for (const [key, value] of Object.entries(mod)) {
      if (key === 'default') continue;
      acceptCandidate(value, `${key}@${path}`);
    }
  }

  console.debug(
    `[ABF] Handlebars helpers registered (${Object.keys(registry).length}):`,
    Object.keys(registry).sort()
  );
};
