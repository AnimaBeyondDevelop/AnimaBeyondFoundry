/**
 * @param {string} versionA - The first version to compare.
 * @param {string} versionB - The second version to compare.
 * @returns {boolean} - Whether the first version is greater than the second.
 */
export default function isVersionGreater(versionA, versionB) {
  const a = versionA.split('.').map(Number);
  const b = versionB.split('.').map(Number);

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const valA = a[i] ?? 0;
    const valB = b[i] ?? 0;

    if (valA > valB) return true;
    if (valA < valB) return false;
  }

  return false; // Son iguales
}