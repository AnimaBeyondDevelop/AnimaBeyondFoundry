// @ts-nocheck
/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your system, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your system
 */
// Import TypeScript modules

import { registerSettings } from "./module/settings.js";
import { preloadTemplates } from "./module/preloadTemplates.js";
import abfActorSheet from "./module/abfActorSheet.js";
import abfRoll from "./module/dice.js";
import abfCombat from "./module/combat.js";
import { abfActor } from "./module/abfActor"

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once("init", async function () {
  console.log("AnimaBeyondFoundry | Initializing AnimaBeyondFoundry");

  // Assign custom classes and constants here
  game.abf = {
    abfRoll,
    abfActor,
  };
  CONFIG.Dice.rolls.unshift(abfRoll);

  CONFIG.Combat.initiative = {
    formula: "1d100xaTurno + @characteristics.secondaries.initiative.value",
  };
  CONFIG.Combat.entityClass = abfCombat;
  CONFIG.Actor.entityClass = abfActor;

  // Register custom system settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();

  Handlebars.registerHelper("concat", function () {
    var outStr = "";
    for (var arg in arguments) {
      if (typeof arguments[arg] != "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  // Register custom sheets (if any)
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("abf", abfActorSheet, { makeDefault: true });
});

/* ------------------------------------ */
/* Setup system							*/
/* ------------------------------------ */
Hooks.once("setup", function () {
  // Do anything after initialization but before
  // ready
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once("ready", function () {
  // Do anything once the system is ready
});

// Add any additional hooks if necessary
