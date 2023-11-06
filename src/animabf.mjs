import { registerSettings } from './utils/registerSettings';
import { preloadTemplates } from './utils/preloadTemplates';
import ABFActorSheet from './module/actor/ABFActorSheet';
import ABFFoundryRoll from './module/rolls/ABFFoundryRoll';
import ABFCombat from './module/combat/ABFCombat';
import { ABFActor } from './module/actor/ABFActor';
import { registerHelpers } from './utils/handlebars-helpers/registerHelpers';
import ABFItemSheet from './module/items/ABFItemSheet';
import { ABFConfig } from './module/ABFConfig';
import ABFItem from './module/items/ABFItem';
import { registerCombatWebsocketRoutes } from './module/combat/websocket/registerCombatWebsocketRoutes';
import { attachCustomMacroBar } from './utils/attachCustomMacroBar';

/* ------------------------------------ */
/* Initialize system */
/* ------------------------------------ */
Hooks.once('init', async () => {
  console.log('AnimaBF | Initializing system');

  // Assign custom classes and constants here
  CONFIG.Actor.documentClass = ABFActor;

  CONFIG.config = ABFConfig;

  window.ABFFoundryRoll = ABFFoundryRoll;
  CONFIG.Dice.rolls = [ABFFoundryRoll, ...CONFIG.Dice.rolls];

  CONFIG.Combat.documentClass = ABFCombat;

  CONFIG.Combat.initiative = {
    formula: '1d100Initiative',
    decimals: 2
  };

  CONFIG.Item.documentClass = ABFItem;

  // Register custom sheets (if any)
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('abf', ABFActorSheet, { makeDefault: true });

  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('abf', ABFItemSheet, {
    makeDefault: true
  });

  // Register custom system settings
  registerSettings();

  registerHelpers();

  // Preload Handlebars templates
  await preloadTemplates();
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
  registerCombatWebsocketRoutes();

  attachCustomMacroBar();
});

// Add any additional hooks if necessary

// This function allow us to use xRoot in templates to extract the root object in Handlebars template
// So, instead to do ../../../ etc... to obtain rootFolder, use xRoot instead
// https://handlebarsjs.com/guide/expressions.html#path-expressions

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line func-names
Handlebars.JavaScriptCompiler.prototype.nameLookup = function (parent, name) {
  if (name.indexOf('xRoot') === 0) {
    return 'data.root';
  }

  if (/^[0-9]+$/.test(name)) {
    return `${parent}[${name}]`;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (Handlebars.JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
    return `${parent}.${name}`;
  }

  return `${parent}['${name}']`;
};