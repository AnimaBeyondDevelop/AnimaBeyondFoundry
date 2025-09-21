/** @typedef {import('./Migration').Migration} Migration

/** @type Migration */
export const Migration1DefaultFumble = {
  id: 'migration_fix-default-fumble',
  version: '1.0.0',
  order: 1,
  title: 'Reseting default values for fumbles and open range in character sheets',
  description: `This Migration changes only actors, implementing the following changes:<br>
    1. If 'system.settings.fumbles.value' is equal to 0, then it is set to the right default value: 3.<br>
    2. If 'system.settings.openRolls.value' is equal to 0, then it is set to the right default value: 90.`,
  updateActor(actor) {
    if (actor.system.general.settings.fumbles.value === 0) {
      actor.system.general.settings.fumbles.value = 3;
    }
    if (actor.system.general.settings.openRolls.value === 0) {
      actor.system.general.settings.openRolls.value = 90;
    }
    return actor;
  }
};
