import { INITIAL_ACTOR_DATA } from '../constants.js';

/**
 * Ensures every general.settings entry exists as `{ value }` objects.
 * Prevents merge/render errors on actors created before new settings were added.
 * @param {object} system
 */
export function ensureGeneralSettingsDefaults(system) {
  const settings = system?.general?.settings;
  if (!settings) return;

  const defaults = INITIAL_ACTOR_DATA.general.settings;

  for (const [key, defaultValue] of Object.entries(defaults)) {
    const current = settings[key];
    if (current == null || typeof current !== 'object' || Array.isArray(current)) {
      settings[key] = foundry.utils.deepClone(defaultValue);
    } else if (!Object.prototype.hasOwnProperty.call(current, 'value')) {
      current.value = defaultValue.value;
    }
  }
}
