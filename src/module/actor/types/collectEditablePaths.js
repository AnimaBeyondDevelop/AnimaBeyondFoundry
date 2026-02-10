const isPrimitive = v => v === null || ['string', 'number', 'boolean'].includes(typeof v);

export function collectEditablePaths(obj, prefix = '') {
  const out = [];

  for (const [k, v] of Object.entries(obj ?? {})) {
    const p = prefix ? `${prefix}.${k}` : k;

    if (isPrimitive(v)) {
      out.push(p);
      continue;
    }

    if (v && typeof v === 'object') {
      const keys = Object.keys(v);

      if (keys.length === 1 && keys[0] === 'value' && isPrimitive(v.value)) {
        out.push(`${p}.value`);
      } else {
        out.push(...collectEditablePaths(v, p));
      }
    }
  }

  return out;
}
