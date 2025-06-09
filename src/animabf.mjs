import { registerSettings } from './utils/registerSettings';
import { Logger, preloadTemplates } from './utils';
import ABFActorSheet from './module/actor/ABFActorSheet';
import ABFFoundryRoll from './module/rolls/ABFFoundryRoll';
import ABFCombat from './module/combat/ABFCombat';
import ABFCombatant from './module/combat/ABFCombatant';
import { ABFActor } from './module/actor/ABFActor';
import { registerHelpers } from './utils/handlebars-helpers/registerHelpers';
import ABFItemSheet from './module/items/ABFItemSheet';
import { ABFConfig } from './module/ABFConfig';
import ABFItem from './module/items/ABFItem';
import ABFActorDirectory from './module/SidebarDirectories/ABFActorDirectory';
import ABFCanvasLayer from './module/CanvasLayers/ABFCanvasLayer';
import ABFCanvas from './module/ABFCanvas';
import { registerCombatWebsocketRoutes } from './module/combat/websocket/registerCombatWebsocketRoutes';
import { attachCustomMacroBar } from './utils/attachCustomMacroBar';
import { applyMigrations } from './module/migration/migrate';
import { TestAppV2 } from '@svelte/test/TestAppV2';

import './scss/animabf.scss';

/* ------------------------------------ */
/* Initialize system */
/* ------------------------------------ */
Hooks.once('init', async () => {
  Logger.log('Initializing system');

  // Assign custom classes and constants here
  CONFIG.Actor.documentClass = ABFActor;

  CONFIG.config = ABFConfig;
  CONFIG.Canvas.layers["abfCanvasLayer"] = ABFCanvasLayer;
  CONFIG.CanvasClass = ABFCanvas;
  console.log("📦 CONFIG.CanvasClass:", CONFIG.CanvasClass?.name);
  window.ABFFoundryRoll = ABFFoundryRoll;
  CONFIG.Dice.rolls = [ABFFoundryRoll, ...CONFIG.Dice.rolls];

  CONFIG.Combat.documentClass = ABFCombat;
  CONFIG.Combatant.documentClass = ABFCombatant;

  CONFIG.Item.documentClass = ABFItem;
  CONFIG.ui.actors = ABFActorDirectory;

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


Hooks.once("canvasReady", async () => {
  console.log("🧪 canvasReady test");

  const layer = new ABFCanvasLayer();
  await layer.draw();

  // Agrega al stage directamente
  canvas.stage.addChild(layer);

  // Opcional: guardar acceso directo
  canvas.abfCanvasLayer = layer;
});

Hooks.once("canvasInit", () => {
  console.log("🌀 canvasInit - Canvas class is", canvas.constructor.name);
  Object.setPrototypeOf(game.canvas, ABFCanvas.prototype);
});

Hooks.on("getSceneControlButtons", (controls) => {
  const tokenControls = controls.find(c => c.name === "token");
  if (tokenControls) {
    tokenControls.tools.push(
      {
        name: "opcion-uno",
        title: "Opción Uno",
        icon: "fas fa-star",
        onClick: () => console.log("Se hizo clic en Opción Uno"),
        button: true
      },
      {
        name: "opcion-dos",
        title: "Opción Dos",
        icon: "fas fa-bolt",
        onClick: () => console.log("Se hizo clic en Opción Dos"),
        button: true
      }
    );
  }

  // Añadir un nuevo grupo con la capa personalizada
  controls.push({
    name: "abf-tools",
    title: "Herramientas ABF",
    icon: "fas fa-dragon",
    layer: "abfCanvasLayer",     // Muy importante: debe coincidir con el nombre de la clase registrada
    tools: [
      {
        name: "abf-opcion-uno",
        title: "ABF Opción Uno",
        icon: "fas fa-feather-alt",
        onClick: () => console.log("Se hizo clic en ABF Opción Uno"),
        button: true
      },
      {
        name: "abf-opcion-dos",
        title: "ABF Opción Dos",
        icon: "fas fa-fire",
        onClick: () => console.log("Se hizo clic en ABF Opción Dos"),
        button: true
      }
    ]
  });
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
