/** @typedef {import('./Migration').Migration} Migration

/** @type Migration */
export const Migration6OldModifiers = {
  id: 'migration_fix-old-modifiers',
  version: '1.0.0',
  order: 1,
  title: 'Migrate modifiers',
  description:
    'The modifiers data structure on the modifiers has changed, and the old ones are ' +
    'lingering arround without being possible to remove or modify them. ' +
    'For that reason, this migration moves "system.general.modifiers.[...].special.value" ' +
    'to system.general.modifiers.[...].base.value.',
  async updateActor(actor) {
    const modifiers = actor.system.general.modifiers;

    const involvedModifiers = [
      'naturalPenalty',
      'physicalActions',
      'perceptionPenalty',
      'allActions'
    ];

    for (const mod of involvedModifiers) {
      if (modifiers[mod].special.value) {
        modifiers[mod].base.value = modifiers[mod].special.value;
        modifiers[mod].special.value = 0;
      }
    }

    return actor;
  }
};
