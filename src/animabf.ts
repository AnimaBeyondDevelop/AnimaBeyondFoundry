/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your system, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * you may want to put a (link to a) license or copyright
 * notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * determines how others may use and modify your system
 */

// Import TypeScript modules
import { registerSettings } from './module/utils/settings';
import { preloadTemplates } from './module/utils/preloadTemplates';
import ABFActorSheet from './module/actor/ABFActorSheet';
import ABFFoundryRoll from './module/rolls/ABFFoundryRoll';
import ABFCombat from './module/ABFCombat';
import { ABFActor } from './module/actor/ABFActor';
import { registerHelpers } from './utils/handlebars-helpers/registerHelpers';

/* ------------------------------------ */
/* Initialize system */
/* ------------------------------------ */
Hooks.once('init', async () => {
  // eslint-disable-next-line no-console
  console.log('AnimaBeyondFoundry | Initializing AnimaBeyondFoundry');

  // Assign custom classes and constants here
  CONFIG.Actor.documentClass = ABFActor;

  CONFIG.Dice.rolls.push(ABFFoundryRoll);

  CONFIG.Combat = {
    documentClass: ABFCombat,
    collection: CombatEncounters,
    defeatedStatusId: 'dead',
    sidebarIcon: 'fas fa-fist-raised',
    initiative: {
      formula: '1d100xaTurno + @characteristics.secondaries.initiative.value',
      decimals: 2
    }
  };

  // Register custom system settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();

  registerHelpers();

  // Register custom sheets (if any)
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('abf', ABFActorSheet, { makeDefault: true });
});

/* ------------------------------------ */
/* Setup system */
/* ------------------------------------ */
Hooks.once('setup', () => {
  // Do anything after initialization but before
  // ready
});

/* ------------------------------------ */
/* When ready */
/* ------------------------------------ */
Hooks.once('ready', () => {
  // Do anything once the system is ready
});

// Add any additional hooks if necessary
