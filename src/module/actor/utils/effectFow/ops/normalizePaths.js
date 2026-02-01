/**
 * Normalize a data path to the canonical form used by the flow graph.
 * Adjust the prefix rule here, and everything stays consistent.
 *
 * @param {string} path
 */
export function normalizePath(path) {
  if (!path) return path;
  if (path.startsWith('system.')) return path;
  return `system.${path}`;
}

/**
 * @param {string[]} paths
 */
export function normalizePaths(paths) {
  if (!Array.isArray(paths)) return [];
  const out = [];
  for (const p of paths) out.push(normalizePath(p));
  return [...new Set(out)];
}
