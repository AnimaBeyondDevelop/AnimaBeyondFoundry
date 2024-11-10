import { Logger } from '../../../utils';

/** @typedef {import('./Migration').Migration} Migration

/** @type Migration */
export const Migration9FixKiSeals = {
  version: 9,
  title: 'Fix ki seals data reference',
  description:
    'Ki seals were using IsActive.value non existing data reference. ' +
    'This migration will ensure ki seals use the intended data reference.',
    updateActor(actor) {
      //wood
      if (typeof actor.system.domine.seals.minor.wood.isActive.value !== 'undefined') {
        actor.system.domine.seals.minor.wood.isActive = actor.system.domine.seals.minor.wood.isActive.value;
      }
      if (typeof actor.system.domine.seals.major.wood.isActive.value !== 'undefined') {
        actor.system.domine.seals.major.wood.isActive = actor.system.domine.seals.major.wood.isActive.value;
      }
      //metal
      if (typeof actor.system.domine.seals.minor.metal.isActive.value !== 'undefined') {
        actor.system.domine.seals.minor.metal.isActive = actor.system.domine.seals.minor.metal.isActive.value;
      }
      if (typeof actor.system.domine.seals.major.metal.isActive.value !== 'undefined') {
        actor.system.domine.seals.major.metal.isActive = actor.system.domine.seals.major.metal.isActive.value;
      }
      //wind
      if (typeof actor.system.domine.seals.minor.wind.isActive.value !== 'undefined') {
        actor.system.domine.seals.minor.wind.isActive = actor.system.domine.seals.minor.wind.isActive.value;
      }
      if (typeof actor.system.domine.seals.major.wind.isActive.value !== 'undefined') {
        actor.system.domine.seals.major.wind.isActive = actor.system.domine.seals.major.wind.isActive.value;
      }
      //water
      if (typeof actor.system.domine.seals.minor.water.isActive.value !== 'undefined') {
        actor.system.domine.seals.minor.water.isActive = actor.system.domine.seals.minor.water.isActive.value;
      }
      if (typeof actor.system.domine.seals.major.water.isActive.value !== 'undefined') {
        actor.system.domine.seals.major.water.isActive = actor.system.domine.seals.major.water.isActive.value;
      }
      return actor;
    }
};
