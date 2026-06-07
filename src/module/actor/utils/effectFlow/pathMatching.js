/* eslint-disable no-continue */

/**
 * Convert a dotted path with "*" wildcards into a RegExp which matches:
 * - exact path
 * - any child path below it (because modifier affects subtree)
 *
 * "*" matches exactly one segment (no dots).
 *
 * @param {string} modPath
 * @returns {RegExp}
 */
function modPathToRegex(modPath) {
  const parts = String(modPath).split('.');
  const escaped = parts
    .map(seg => {
      if (seg === '*') return '[^.]+';
      return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('\\.');

  // Match exact OR any descendant:  ^<path>(\.|$)
  return new RegExp('^' + escaped + '(\\.|$)');
}

/**
 * Checks if a modifier path affects a dependency path.
 * ONE-WAY ONLY: modifier => dependent.
 *
 * @param {string} modPath
 * @param {string} depPath
 */
export function pathAffects(modPath, depPath) {
  if (modPath === depPath) return true;

  // Fast path (no wildcard): subtree prefix
  if (!modPath.includes('*')) return depPath.startsWith(modPath + '.');

  // Wildcard path
  return modPathToRegex(modPath).test(depPath);
}
