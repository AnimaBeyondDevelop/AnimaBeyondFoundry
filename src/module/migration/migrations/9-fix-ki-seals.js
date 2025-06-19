import { Logger } from '../../../utils';

/** @typedef {import('./Migration').Migration} Migration

/** @type Migration */
export const Migration9FixKiSeals = {
  id: 'migration_fix-ki-seals',
  version: '1.0.0',
  order: 1,
  title: 'Fix ki seals data reference',
  description:
    'Ki seals were using IsActive.value non existing data reference. ' +
    'This migration will ensure ki seals use the intended data reference.',
    updateActor(actor) {
      let minorSeals = {
        wood: actor.system.domine.seals.minor.wood,
        metal: actor.system.domine.seals.minor.metal,
        wind: actor.system.domine.seals.minor.wind,
        water: actor.system.domine.seals.minor.water
      };
      let majorSeals = {
        wood: actor.system.domine.seals.major.wood,
        metal: actor.system.domine.seals.major.metal,
        wind: actor.system.domine.seals.major.wind,
        water: actor.system.domine.seals.major.water
      };
      //wood
      if (typeof minorSeals.wood.isActive.value !== 'undefined') {
        minorSeals.wood.isActive = minorSeals.wood.isActive.value;
      }
      if (typeof majorSeals.wood.isActive.value !== 'undefined') {
        majorSeals.wood.isActive = majorSeals.wood.isActive.value;
      }
      //metal
      if (typeof minorSeals.metal.isActive.value !== 'undefined') {
        minorSeals.metal.isActive = minorSeals.metal.isActive.value;
      }
      if (typeof majorSeals.metal.isActive.value !== 'undefined') {
        majorSeals.metal.isActive = majorSeals.metal.isActive.value;
      }
      //wind
      if (typeof minorSeals.wind.isActive.value !== 'undefined') {
        minorSeals.wind.isActive = minorSeals.wind.isActive.value;
      }
      if (typeof majorSeals.wind.isActive.value !== 'undefined') {
        majorSeals.wind.isActive = majorSeals.wind.isActive.value;
      }
      //water
      if (typeof minorSeals.water.isActive.value !== 'undefined') {
        minorSeals.water.isActive = minorSeals.water.isActive.value;
      }
      if (typeof majorSeals.water.isActive.value !== 'undefined') {
        majorSeals.water.isActive = majorSeals.water.isActive.value;
      }

      actor.system.domine.seals.minor= minorSeals;
      actor.system.domine.seals.major= majorSeals;
      return actor;
    }
};
