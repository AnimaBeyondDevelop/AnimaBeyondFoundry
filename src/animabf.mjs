import { registerSettings, ABFSettingsKeys } from './utils/registerSettings';
import { Logger, preloadTemplates } from './utils';
import ABFActorSheet from './module/actor/ABFActorSheet';
import ABFFoundryRoll from './module/rolls/ABFFoundryRoll';
import ABFCombat from './module/combat/ABFCombat';
import { ABFActor } from './module/actor/ABFActor';
import { registerHelpers } from './utils/handlebars-helpers/registerHelpers';
import ABFItemSheet from './module/items/ABFItemSheet';
import { ABFConfig } from './module/ABFConfig';
import ABFItem from './module/items/ABFItem';
import ABFActorDirectory from './module/SidebarDirectories/ABFActorDirectory';
import { registerCombatWebsocketRoutes } from './module/combat/websocket/registerCombatWebsocketRoutes';
import { attachCustomMacroBar } from './utils/attachCustomMacroBar';
import { registerKeyBindings } from './utils/registerKeyBindings';
import { applyMigrations } from './module/migration/migrate';
import { registerGlobalTypes } from './utils/registerGlobalTypes';
import ABFCombatant from './module/combat/ABFCombatant';

import { chatActionHandlers } from './utils/chatActionHandlers.js';
import { preloadClickHandlers } from './module/actor/utils/createClickHandlers.js';

import { ABFAttackData } from './module/combat/ABFAttackData.js';
import { getChatContextMenuFactories } from './utils/buildChatContextMenu.js';
import { Templates } from './module/utils/constants';

import './scss/animabf.scss';

import { System, registerSystemOnGame } from './utils/systemMeta';

import { resolveTokenName } from './utils/tokenName.js';

/* ------------------------------------ */
/* Initialize system */
/* ------------------------------------ */
Hooks.once('init', async () => {
  Logger.log('Initializing system');
  registerSystemOnGame();
  Logger.log('Game Id:' + System.id);

  // Preload Handlebars templates
  await preloadTemplates();

  // Assign custom classes and constants here
  CONFIG.Actor.documentClass = ABFActor;

  CONFIG.config = ABFConfig;

  window.ABFFoundryRoll = ABFFoundryRoll;
  CONFIG.Dice.rolls = [ABFFoundryRoll, ...CONFIG.Dice.rolls];

  CONFIG.Combat.documentClass = ABFCombat;
  CONFIG.Combatant.documentClass = ABFCombatant;

  CONFIG.Item.documentClass = ABFItem;
  CONFIG.ui.actors = ABFActorDirectory;

  // Register custom sheets (if any)
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet(System.id, ABFActorSheet, { makeDefault: true });

  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet(System.id, ABFItemSheet, {
    makeDefault: true
  });

  // Register custom system settings
  registerSettings(System.id);

  registerHelpers();

  registerKeyBindings();

  // Warm-up click handlers so they stay cached for later use from sheets
  preloadClickHandlers();
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
Hooks.once('ready', async () => {
  if (game.user.isGM) {
    const creationVersion = game.settings.get(
      System.id,
      ABFSettingsKeys.WORLD_CREATION_SYSTEM_VERSION
    );
    if (!creationVersion) {
      await game.settings.set(
        System.id,
        ABFSettingsKeys.WORLD_CREATION_SYSTEM_VERSION,
        game.system.version
      );
      console.log(`Registrada versión de creación del mundo: ${game.system.version}`);
    }
  }

  registerCombatWebsocketRoutes();
  //attachCustomMacroBar();
  applyMigrations();
  registerGlobalTypes();

  // --- Expose public API for user macros (ABFAttackData) ---
  game.animabf ??= {};
  game.animabf.api ??= {};
  Object.assign(game.animabf.api, { ABFAttackData });

  // GM-side socket to update attack targets flag
  game.socket.on('system.animabf', async p => {
    if (!game.user.isGM) return;
    if (!p || p.op !== 'updateAttackTargets') return;

    const msg = game.messages.get(p.messageId);
    if (!msg) return;
    const kind = msg.getFlag(System.id, 'kind');
    if (kind !== 'attackData') return;

    const entry = p.entry ?? {};
    const targets = foundry.utils.duplicate(msg.getFlag(System.id, 'targets') ?? []);

    const findIndexByKey = (arr, e) => {
      if (e.tokenUuid) {
        const iTok = arr.findIndex(t => t.tokenUuid === e.tokenUuid);
        if (iTok >= 0) return iTok;
      }
      if (e.actorUuid && !e.tokenUuid) {
        return arr.findIndex(t => t.actorUuid === e.actorUuid && !t.tokenUuid);
      }
      return -1;
    };

    const i = findIndexByKey(targets, entry);
    if (i >= 0) targets[i] = { ...targets[i], ...entry };
    else targets.push(entry);

    await msg.setFlag(System.id, 'targets', targets);
    ui.chat?.updateMessage?.(msg);
  });
});

Hooks.on('renderChatMessage', async (message, html) => {
  html.on('click', '.contractible-button', e => {
    $(e.currentTarget).closest('.contractible-group').toggleClass('contracted');
  });

  if (!game.user.isGM) {
    html.find('.only-if-gm').remove();
    html.find('[data-requires-permission="gm"]').remove();
  }
  const speakerActorId = message.speaker?.actor;
  const speakerActor = speakerActorId ? game.actors.get(speakerActorId) : null;
  if (
    speakerActor &&
    !speakerActor.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
  ) {
    html.find('.only-if-owner').remove();
    html.find('[data-requires-permission="owner"]').remove();
  }

  html.on('click', '.chat-action-button', e => {
    const action = e.currentTarget.dataset.action;
    const handler = chatActionHandlers[action];
    if (handler) handler(message, html, e.currentTarget.dataset);
    else console.warn(`No handler found for action: ${action}`);
  });

  if (message.getFlag(System.id, 'kind') !== 'attackData') return;

  const flags = message.flags?.animabf ?? {};
  const targets = Array.isArray(flags.targets) ? [...flags.targets] : [];

  const rowId = `#animabf-defense-row-${message.id}`;
  const $row = html.find(rowId);
  if (!$row.length) return;

  if (!targets.length) {
    $row.empty();
    if (game.user.isGM) {
      $row.append(
        `<span class="hint" style="opacity:.7;">${game.i18n.localize(
          'chat.attackData.noTargets'
        )}</span>`
      );
    }
    return;
  }

  const order = { pending: 0, rolling: 1, done: 2, expired: 3 };
  targets.sort((a, b) => (order[a.state] ?? 99) - (order[b.state] ?? 99));

  const me = game.user;
  const enriched = targets.map(t => {
    const actor = t.actorUuid ? game.actors.get(t.actorUuid) : null;
    const canDefend =
      me.isGM || actor?.testUserPermission?.(me, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
    const state = t.state ?? 'pending';
    const dot =
      state === 'done'
        ? '🟢'
        : state === 'rolling'
        ? '🟠'
        : state === 'expired'
        ? '⚪'
        : '🟡';

    const rollerName =
      state !== 'pending' && t.rolledBy
        ? game.users.get(t.rolledBy)?.name ?? t.rolledBy
        : null;

    const rollerTitle = rollerName
      ? game.i18n.format('chat.attackData.rollingBy', { name: rollerName })
      : '';

    // Token name resolver: UUID -> canvas -> same scene -> any scene
    const tokenName = (() => {
      const id = t.tokenUuid;
      if (!id) return null;
      try {
        if (typeof id === 'string' && id.includes('.')) {
          const doc = fromUuidSync(id);
          return doc?.name ?? doc?.document?.name ?? doc?.object?.name ?? null;
        }
        const onCanvas = canvas?.tokens?.get?.(id);
        if (onCanvas) return onCanvas.name ?? onCanvas.document?.name ?? null;

        const sceneId = message.speaker?.scene;
        if (sceneId) {
          const tok = game.scenes?.get(sceneId)?.tokens?.get?.(id);
          if (tok) return tok.name;
        }

        for (const s of game.scenes) {
          const tok = s.tokens?.get?.(id);
          if (tok) return tok.name;
        }
      } catch {}
      return null;
    })();

    const tokenLabel = resolveTokenName(
      { tokenUuid: t.tokenUuid, actorUuid: t.actorUuid },
      { message }
    );

    const label =
      t.label ?? tokenLabel ?? actor?.name ?? game.i18n.localize('chat.common.target');

    return {
      messageId: message.id,
      actorUuid: t.actorUuid ?? '',
      tokenUuid: t.tokenUuid ?? '',
      state,
      stateDot: dot,
      stateLabel: game.i18n.localize(`chat.attackData.state.${state}`),
      rollerName,
      rollerTitle,
      label,
      showDefendButton: !!(canDefend && state === 'pending')
    };
  });

  const chipsHTML = await renderTemplate(Templates.Chat.AttackTargetsChips, {
    targets: enriched
  });
  $row.html(chipsHTML);
});

Hooks.on('getChatMessageContextOptions', (_app, menu) => {
  const menuItemFactories = getChatContextMenuFactories();

  for (const makeItem of menuItemFactories) {
    const item = makeItem();
    if (Array.isArray(item)) menu.push(...item);
    else menu.push(item);
  }
});

// // Auto-number unlinked tokens as "{name} (n)" when dropped
// Hooks.on('createToken', async doc => {
//   // Ignore linked tokens
//   if (doc.actorLink) return;

//   // Helper to escape regex
//   const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

//   const baseName = doc.name ?? doc.actor?.name ?? 'Token';
//   const rx = new RegExp(`^${esc(baseName)}(?: \\((\\d+)\\))?$`);

//   // Find siblings with same baseName
//   const siblings = doc.parent.tokens.filter(
//     t => t.id !== doc.id && rx.test(t.name ?? '')
//   );
//   let max = 0;
//   for (const t of siblings) {
//     const m = (t.name ?? '').match(rx);
//     if (m) max = Math.max(max, m[1] ? Number(m[1]) : 1);
//   }

//   const next = max ? max + 1 : 1;
//   await doc.update({ name: `${baseName} (${next})` });
// });

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
