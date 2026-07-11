/** @typedef {import('./Migration').Migration} Migration */

import { ensureGeneralSettingsDefaults } from '../../actor/utils/ensureGeneralSettingsDefaults.js';

/** @type Migration */
export const Migration15DefenseTypeToMassSettings = {
  id: 'migration_defense-type-to-mass-settings',
  version: '2.2.3',
  order: 1,
  title: 'Migrate defense type to mass settings checkboxes',
  description: `This migration updates actor settings:<br>
    1. <code>defenseType: 'mass'</code> becomes <code>massOfEnemies: true</code>.<br>
    2. <code>defenseType: 'resistance'</code> becomes <code>damageAccumulation: true</code>.<br>
    3. Legacy <code>defenseType</code> is cleared.<br>
    4. New mass-related settings receive default values when missing.`,

  filterActors(actor) {
    const settings = actor.system?.general?.settings;
    if (!settings) return false;

    const defenseType = settings.defenseType?.value;
    const needsDefenseTypeMigration =
      defenseType === 'mass' || defenseType === 'resistance';

    const needsDefaults = !settings.massOfEnemies || !settings.damageAccumulation;

    return needsDefenseTypeMigration || needsDefaults;
  },

  updateActor(actor) {
    ensureGeneralSettingsDefaults(actor.system);

    const settings = actor.system.general.settings;
    const defenseType = settings.defenseType?.value;
    if (defenseType === 'mass') {
      settings.massOfEnemies.value = true;
    } else if (defenseType === 'resistance') {
      settings.damageAccumulation.value = true;
    }

    settings.defenseType.value = '';

    return actor;
  }
};
