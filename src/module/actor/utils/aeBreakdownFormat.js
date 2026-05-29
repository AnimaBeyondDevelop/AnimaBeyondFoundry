// /module/actor/utils/aeBreakdownFormat.js

/**
 * Build the HTML snippet appended to a roll's flavor that lists the Active
 * Effects contributing to an attribute used in the roll. Linear (add)
 * effects show their signed delta; non-linear effects (multiply/override)
 * are labelled so the GM knows the formula could not split them out
 * cleanly.
 *
 * One entry per change. If a single AE writes to several paths that all
 * feed into the same roll, each change is listed on its own — that visible
 * separation is what surfaces routing bugs (e.g. a path leaking into the
 * wrong attribute), so we deliberately do NOT group by effect name here.
 *
 * Shared between CombatAttackDialog and AttackConfigurationDialog (and any
 * future dialog that wants to expose the same nominal trace in chat).
 *
 * @param {{items: Array, hasNonLinear: boolean}} breakdown
 * @returns {string} HTML to append to a roll flavor, empty if no items.
 */
export function formatAeBreakdownForFlavor(breakdown) {
  if (!breakdown?.items?.length) return '';

  const parts = breakdown.items.map(it => {
    if (it.isLinear) {
      const sign = it.value >= 0 ? '+' : '';
      return `${it.effectName} (${sign}${it.value})`;
    }
    const tag = it.mode === 'override' ? 'override' : it.mode;
    return `${it.effectName} (${tag})`;
  });

  const label = breakdown.hasNonLinear ? 'Mod (no descompuesto)' : 'Mod';
  return `<br><small><em>${label}: ${parts.join(', ')}</em></small>`;
}
