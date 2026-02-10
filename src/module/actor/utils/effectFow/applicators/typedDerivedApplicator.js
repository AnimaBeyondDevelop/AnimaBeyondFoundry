function keyFromAbsPath(absPath) {
  const parts = absPath.split('.');
  const last = parts.at(-1);

  // "...base.value" -> "base"
  if (last === 'value' && parts.length >= 2) return parts.at(-2);

  // "...formula" -> "formula", "...calculateBaseFromFormula" -> "calculateBaseFromFormula"
  return last;
}

/**
 * @param {any} actor
 * @param {{
 *   depsAbs: string[],
 *   writes: { path:string, kind:'overwrite'|'modify' }[],
 *   compute: (inputs:Record<string,any>)=>Record<string,any>
 * }} specAbs
 */
export function applyTypedDerivedSpec(actor, specAbs) {
  const inputs = {};

  // 🔹 Read inputs
  for (const p of specAbs.depsAbs) {
    inputs[keyFromAbsPath(p)] = foundry.utils.getProperty(actor, p);
  }

  // 🔹 Compute outputs (pure function from type)
  const out = specAbs.compute(inputs) ?? {};

  // 🔹 Apply outputs
  for (const w of specAbs.writes) {
    const key = keyFromAbsPath(w.path);

    if (!(key in out)) continue;

    const current = foundry.utils.getProperty(actor, w.path);
    const next = out[key];

    if (w.kind === 'modify' && typeof current === 'number' && typeof next === 'number') {
      foundry.utils.setProperty(actor, w.path, current + next);
    } else {
      // overwrite (default)
      foundry.utils.setProperty(actor, w.path, next);
    }
  }
}
