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
import { applyMigrations } from './module/migration/migrate';
import { ABFScene } from './module/scenes/ABFScene';
import { ABFSceneConfig } from './module/scenes/ABFSceneConfig';

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

  CONFIG.Scene.documentClass = ABFScene;
  // Register the new scene configuration class
  CONFIG.Scene.sheetClass = ABFSceneConfig;

  // Register a new game setting to store custom field data
  game.settings.register("custom-scene-tab", "customField", {
    name: "Custom Field",
    hint: "A custom field for the scene configuration.",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

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

  applyMigrations();
});

//--------------------------------------------------------------------------------------

// Hooks.on('renderSceneConfig', (app, html, data) => {
//   const weatherField = `
//     <div class="form-group">
//       <label>Weather</label>
//       <input type="text" name="weather" value="${app.object.data.weather || 'sunny'}">
//     </div>
//   `;

//   // Insert the custom field into the form
//   const form = html.find('form');
//   form.append(weatherField);
// });

// Hooks.on("renderSceneConfig", (app, html, data) => {
//   const customTab = `
//     <div class="tab" data-tab="custom">
//       <h3>ABF Config Tab</h3>
//       <div class="form-group">
//         <label>Custom Field</label>
//         <input type="text" name="customField" value="${app.object.data.weather || 'sunny'}" />
//       </div>
//     </div>
//   `;
//   html.find('.tabs a.item').last().after(`<a class="item" data-tab="custom">ABF Config</a>`);
//   html.find('.tab-content').last().after(customTab);
// });

Hooks.on("renderSceneConfig", (app, html, data) => {
  const customTab = `
    <div class="tab" data-tab="abf-config">
      <h3>ABF Config</h3>
      <div class="form-group">
        aghsdhrtjrj
      </div>
    </div>
  `;
  html.find('.tabs a.item').last().after(`<a class="item" data-tab="abf-config">ABF Config</a>`);
  html.find('.tab-content').last().after(customTab);
});

//--------------------------------------------------------------------------------------

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