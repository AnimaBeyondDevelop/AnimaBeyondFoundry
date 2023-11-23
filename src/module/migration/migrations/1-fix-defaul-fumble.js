/** @typedef {import('./Migration').Migration} Migration

/** @type Migration */
export const Migration1DefaultFumble = {
  version: 1,
  title: 'Reseting default values for fumbles and open range in character sheets',
  description: `This Migration changes only actors, implementing the following changes:<br>
    1. If 'system.settings.fumbles.value' is equal to 0, then it is set to the right default value: 3.<br>
    2. If 'system.settings.openRolls.value' is equal to 0, then it is set to the right default value: 90.`,
  updateActor(data) {
    if (data.general.settings.fumbles.value === 0) {
      data.general.settings.fumbles.value = 3;
    }
    if (data.general.settings.openRolls.value === 0) {
      data.general.settings.openRolls.value = 90;
    }
    return data;
  }
};
