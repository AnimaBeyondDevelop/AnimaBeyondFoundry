import { openModDialog } from '../utils/dialogs/openSimpleInputDialog';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll';
import { splitAsActorAndItemChanges } from './utils/splitAsActorAndItemChanges';
import { unflat } from './utils/unflat';
import { ALL_ITEM_CONFIGURATIONS } from './utils/prepareItems/constants';
import { INITIAL_EFFECT_DATA } from '../types/effects/EffectItemConfig';
import { getFieldValueFromPath } from './utils/prepareItems/util/getFieldValueFromPath';
import { getUpdateObjectFromPath } from './utils/prepareItems/util/getUpdateObjectFromPath';
import { ABFItems } from '../items/ABFItems';
import { ABFDialogs } from '../dialogs/ABFDialogs';
import { Logger } from '../../utils';
import { ABFSettingsKeys } from '../../utils/registerSettings';
import { createClickHandlers } from './utils/createClickHandlers';
import { TypeEditorRegistry } from './types/TypeEditorRegistry.js';

/** @typedef {import('./constants').TActorData} TData */
/** @typedef {typeof FormApplication<FormApplicationOptions, TData, TData>} TFormApplication */
const ActorSheetV1 = foundry.appv1?.sheets?.ActorSheet ?? ActorSheet;
export default class ABFActorSheet extends ActorSheetV1 {
  i18n;

  constructor(actor, options) {
    super(actor, options);

    this.i18n = game.i18n;

    this.position.width = this.getWidthDependingFromContent();
  }

  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      ...{
        classes: [game.animabf.id, 'sheet', 'actor'],
        template: 'systems/animabf/templates/actor/actor-sheet.hbs',
        width: 1100,
        height: 850,
        submitOnChange: false,
        viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
        tabs: [
          {
            navSelector: '.sheet-tabs',
            contentSelector: '.sheet-body',
            initial: 'main'
          },
          {
            navSelector: '.mystic-tabs',
            contentSelector: '.mystic-body',
            initial: 'mystic-main'
          },
          {
            navSelector: '.general-tabs',
            contentSelector: '.general-body',
            initial: 'general-first'
          },
          {
            navSelector: '.psychic-tabs',
            contentSelector: '.psychic-body',
            initial: 'psychic-main'
          }
        ]
      }
    };
  }

  get template() {
    return 'systems/animabf/templates/actor/actor-sheet.hbs';
  }

  async close(options = {}) {
    this._isClosing = true;

    try {
      await this._flushPendingSheetUpdatesImmediately();

      // Capture image before close; persist it after close to avoid re-render race.
      const nextImg = this._getEditedActorImage();

      await super.close({
        ...options,
        // Avoid submitting the whole form on close: it can persist derived/AE-applied values.
        submit: options.submit ?? false
      });

      await this._persistActorImageIfChanged(nextImg);

      this.position.width = this.getWidthDependingFromContent();
    } finally {
      this._isClosing = false;
    }
  }

  _getEditedActorImage() {
    const imgEl = this.element?.find?.("[data-edit='img']")?.[0];
    return imgEl?.getAttribute?.('src')?.trim?.() ?? '';
  }

  async _persistActorImageIfChanged(nextImg = '') {
    if (!this.options.editable) return false;

    if (!nextImg || nextImg === this.actor.img) return false;

    await this.actor.update({ img: nextImg });
    await this._refreshActorDirectoryImage(nextImg);
    return true;
  }

  async _refreshActorDirectoryImage(nextImg) {
    const actorDirectory = ui.actors ?? ui.sidebar?.tabs?.actors ?? null;

    actorDirectory?.render?.(true);

    const selectors = [
      `[data-entry-id="${this.actor.id}"] img`,
      `[data-document-id="${this.actor.id}"] img`
    ];

    for (const selector of selectors) {
      actorDirectory?.element?.find?.(selector)?.attr?.('src', nextImg);
    }
  }

  getWidthDependingFromContent() {
    if (this.actor.items.filter(i => i.type === ABFItems.SPELL).length > 0) {
      return 1300;
    }

    return 1100;
  }

  async _render(force, options = {}) {
    if (this._isClosing) return;

    // If user permission is exactly LIMITED, then display image popout and quit; else do normal render
    if (force && this.actor.testUserPermission(game.user, 'LIMITED', { exact: true })) {
      this.displayActorImagePopout();
      return;
    }
    return super._render(force, options);
  }

  displayActorImagePopout() {
    const imagePopout = new ImagePopout(this.actor.img, {
      title: this.actor.name,
      uuid: this.actor.uuid
    });
    imagePopout.render(true);
  }

  async getData(options) {
    const sheet = await super.getData(options);

    const { actor } = this; // use the real Document, not sheet.actor

    if (actor?.type === 'character') {
      await actor.prepareDerivedData();
      sheet.system = actor.system;
    }

    sheet.config = CONFIG.config;

    const permissions = game.settings.get(
      game.animabf.id,
      ABFSettingsKeys.MODIFY_DICE_FORMULAS_PERMISSION
    );
    sheet.canModifyDice = permissions?.[game.user.role] === true;

    // Use embedded item collection directly
    const effectItems = actor.items.filter(i => i && i.type === ABFItems.EFFECT);
    sheet.effects = effectItems;

    console.log('EFFECT ITEMS EN SHEET', sheet.effects);

    return sheet;
  }

  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;

    this._activateBaseTypeContextMenu(html);

    this._setupDebouncedSheetUpdates(html);

    this._activateRollables(html);
    this._activateContractibleButtons(html);
    this._activateItemsDragAndContextMenus(html);
    this._activateDataOnClickHandlers(html);
    this._activateEffectControls(html);
  }

  _activateBaseTypeContextMenu(html) {
    const ContextMenuImpl = foundry.applications?.ux?.ContextMenu?.implementation ?? ContextMenu;
    const isV14 = !!foundry.applications?.ux?.ContextMenu?.implementation;
    new ContextMenuImpl(
      html instanceof HTMLElement ? html : html[0],
      '.base-type-row',
      [
        {
          name: game.i18n.localize('contextualMenu.common.options.edit') ?? 'Edit…',
          icon: '<i class="fas fa-edit"></i>',
          callback: target => this._openBaseTypeEditor(target instanceof HTMLElement ? target : target[0])
        }
      ],
      ...(isV14 ? [{ jQuery: false }] : [])
    );
  }

  async _flushPendingSheetUpdatesImmediately() {
    const flat = this._pendingUpdate;

    this._flushPendingUpdate?.cancel?.();
    this._pendingUpdate = {};

    await this._applyFlatChanges(flat);
  }

  async _applyFlatChanges(flat) {
    if (!flat || Object.keys(flat).length === 0) return;

    const [actorChanges, itemChanges] = splitAsActorAndItemChanges(flat);

    await this.updateItems(itemChanges);

    if (actorChanges && Object.keys(actorChanges).length > 0) {
      await this.actor.update(actorChanges);
    }
  }

  _setupDebouncedSheetUpdates(html) {
    this._pendingUpdate = {};

    // Build debounce once
    this._flushPendingUpdate =
      this._flushPendingUpdate ??
      foundry.utils.debounce(async () => {
        const flat = this._pendingUpdate;
        this._pendingUpdate = {};

        await this._applyFlatChanges(flat);
      }, 150);

    // IMPORTANT: remove previous handlers for this sheet instance
    html.off('change.animabf');

    html.on('change.animabf', 'input, select, textarea', ev => {
      const el = ev.currentTarget;
      if (!el?.name) return;

      let value = el.type === 'checkbox' ? el.checked : el.value;

      const dtype = el.dataset?.dtype;
      if (dtype === 'Number' || el.type === 'number') {
        const n = Number(value);
        value = Number.isFinite(n) ? n : 0;
      } else if (dtype === 'Boolean') {
        value = value === 'true' || value === true;
      }

      this._pendingUpdate[el.name] = value;
      this._flushPendingUpdate();
    });
  }

  _activateRollables(html) {
    html.find('.rollable').click(e => this._onRoll(e));
  }

  _activateContractibleButtons(html) {
    html.find('.contractible-button').click(e => {
      const { contractibleItemId } = e.currentTarget.dataset;
      if (!contractibleItemId) return;

      const { ui } = this.actor.system;
      ui.contractibleItems = {
        ...ui.contractibleItems,
        [contractibleItemId]: !ui.contractibleItems[contractibleItemId]
      };

      this.actor.update({ system: { ui } });
    });
  }

  _activateItemsDragAndContextMenus(html) {
    const handler = ev => this._onDragStart(ev);

    for (const item of Object.values(ALL_ITEM_CONFIGURATIONS)) {
      this.buildCommonContextualMenu(item);

      html.find(item.selectors.rowSelector).each((_, row) => {
        row.setAttribute('draggable', 'true');
        row.addEventListener('dragstart', handler, false);
      });

      html.find(`[data-on-click="${item.selectors.addItemButtonSelector}"]`).click(() => {
        item.onCreate(this.actor);
      });
    }
  }

  _activateDataOnClickHandlers(html) {
    const clickHandlers = createClickHandlers(this);

    html.find('[data-on-click]').click(e => {
      const key = e.currentTarget.dataset.onClick;
      const handler = clickHandlers[key];
      if (handler) handler(e);
      else console.warn(`No handler for data-on-click="${key}"`);
    });
  }

  _activateEffectControls(html) {
    html.find('.effect-control').click(this._onEffectControl.bind(this));
  }

  _openBaseTypeEditor(el) {
    const path = el?.dataset?.path;
    if (!path) return;

    const node = this.actor.typedNodes?.get(path) ?? null;
    if (!node) return;

    const { type } = node.constructor;

    const app = TypeEditorRegistry.create(type, this.actor, { path });
    app?.render(true);
  }

  async _onEffectControl(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const { action } = a.dataset;
    const li = a.closest('.effect');
    const itemId = li?.dataset.itemId;
    const item = itemId ? this.actor.items.get(itemId) : null;

    switch (action) {
      case 'create': {
        const name = game.i18n.localize('anima.effects.newEffect') ?? 'New Effect';
        const [created] = await this.actor.createEmbeddedDocuments('Item', [
          {
            type: ABFItems.EFFECT,
            name,
            system: INITIAL_EFFECT_DATA
          }
        ]);
        if (created?.sheet) created.sheet.render(true);
        return;
      }

      case 'edit': {
        if (!item) return;

        // Asegura que exista un AE vinculado a este item
        const effect = await this._ensureEffectForItem(item);
        if (!effect) return;

        // Configura la sincronización item <-> AE
        this._setupEffectSync(item, effect);

        return effect.sheet?.render(true);
      }

      case 'delete': {
        if (!itemId) return;

        const item = this.actor.items.get(itemId);
        if (!item) return;

        // get linked AE
        const effect = this._getLinkedEffect(item);

        const deletions = [];

        // delete item
        deletions.push(this.actor.deleteEmbeddedDocuments('Item', [itemId]));

        // delete linked AE
        if (effect) {
          deletions.push(this.actor.deleteEmbeddedDocuments('ActiveEffect', [effect.id]));
        }

        return Promise.all(deletions);
      }

      case 'toggle': {
        if (!item) return;

        const newActive = !item.system.active;
        await item.update({ 'system.active': newActive });

        const effect = this._getLinkedEffect(item);
        if (effect) {
          await effect.update({ disabled: !newActive });
        }
      }

      default:
    }
  }

  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const { dataset } = element;

    if (dataset.roll) {
      const label = dataset.label ? `Rolling ${dataset.label}` : '';
      const mod = await openModDialog();
      const rollValue = this._getRollValueFromDataset(element, dataset);
      let formula = dataset.rollPath
        ? `${this._getRollDieFormula(dataset.roll)} + ${rollValue} + ${mod ?? 0}`
        : `${dataset.roll}+ ${mod ?? 0}`;
      const masteryValue = this._getMasteryValueFromDataset(
        element,
        dataset,
        rollValue
      );
      if (masteryValue >= 200) {
        formula = formula.replace(
          this.actor.system.general.diceSettings.abilityDie.value,
          this.actor.system.general.diceSettings.abilityMasteryDie.value
        );
        // let splittedFormula = formula.split(
        //   this.actor.system.general.diceSettings.abilityDie.value
        // );
        // formula = splittedFormula.join(
        //   this.actor.system.general.diceSettings.abilityMasteryDie.value
        // );
      }
      const roll = new ABFFoundryRoll(formula, this.actor.system);

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  _getRollDieFormula(rollFormula) {
    return String(rollFormula).split('+')[0].trim();
  }

  _getRollValueFromDataset(element, dataset) {
    if (!dataset.rollPath) {
      return Number(dataset.roll?.split('+')?.[1] ?? 0);
    }

    return Number(this._resolveRollPathValue(element, dataset.rollPath) ?? 0);
  }

  _getMasteryValueFromDataset(element, dataset, fallbackValue = 0) {
    if (!dataset.extraPath) {
      return Number(dataset.extra ?? fallbackValue ?? 0);
    }

    return Number(
      this._resolveRollPathValue(element, dataset.extraPath) ?? fallbackValue
    );
  }

  _resolveRollPathValue(element, path) {
    const actorValue = foundry.utils.getProperty(this.actor, path);
    if (actorValue !== undefined) return actorValue;

    const dynamicItemMatch = String(path).match(
      /^system\.dynamic\.[^.]+\.(?<itemId>[^.]+)\.(?<itemPath>.+)$/
    );

    if (dynamicItemMatch?.groups) {
      const { itemId, itemPath } = dynamicItemMatch.groups;
      const itemValue = foundry.utils.getProperty(this.actor.items.get(itemId), itemPath);
      if (itemValue !== undefined) return itemValue;
    }

    const itemId = element?.closest?.('[data-item-id]')?.dataset?.itemId;
    if (!itemId) return undefined;

    return foundry.utils.getProperty(this.actor.items.get(itemId), path);
  }

  protected;

  async _updateObject(event, formData) {
    const [actorChanges, itemChanges] = splitAsActorAndItemChanges(formData);

    await this.updateItems(itemChanges);

    return super._updateObject(event, actorChanges);
  }

  async updateItems(_changes) {
    if (!_changes || Object.keys(_changes).length === 0) return;

    const changes = unflat(_changes);

    for (const item of Object.values(ALL_ITEM_CONFIGURATIONS)) {
      const fromDynamicChanges = item.getFromDynamicChanges(changes);

      if (fromDynamicChanges) {
        await item.onUpdate(this.actor, fromDynamicChanges);
      }
    }
  }

  buildCommonContextualMenu = itemConfig => {
    const {
      selectors: { containerSelector, rowSelector },
      fieldPath,
      hideDeleteRow
    } = itemConfig;

    const deleteRowMessage =
      itemConfig.contextMenuConfig?.customDeleteRowMessage ??
      this.i18n.localize('contextualMenu.common.options.delete');

    const customCallbackFn = itemConfig.onDelete;

    const otherItems =
      itemConfig.contextMenuConfig?.buildExtraOptionsInContextMenu?.(this.actor) ?? [];

    if (!itemConfig.isInternal && itemConfig.hasSheet) {
      otherItems.push({
        name: this.i18n.localize('contextualMenu.common.options.edit'),
        icon: '<i class="fas fa-edit"></i>',
        callback: target => {
          const { itemId } = (target instanceof HTMLElement ? target : target[0]).dataset;

          if (itemId) {
            const item = this.actor.items.get(itemId);

            if (item?.sheet) {
              item.sheet.render(true);
            } else {
              Logger.warn('Item sheet was not found for item:', item);
            }
          } else {
            Logger.warn('Item ID was not found for target:', target);
          }
        }
      });
    }

    if (!hideDeleteRow) {
      otherItems.push({
        name: deleteRowMessage,
        icon: '<i class="fas fa-trash"></i>',
        callback: target => {
          if (!customCallbackFn && !fieldPath) {
            Logger.warn(
              `buildCommonContextualMenu: no custom callback and configuration set, could not delete the item: ${itemConfig.type}`
            );
          }

          if (customCallbackFn) {
            customCallbackFn(this.actor, target);
          } else {
            const id = (target instanceof HTMLElement ? target : target[0]).dataset.itemId;

            if (!id) {
              throw new Error(
                'Data id missing. Are you sure to set data-item-id to rows?'
              );
            }

            ABFDialogs.confirm(
              this.i18n.localize('dialogs.items.delete.title'),
              this.i18n.localize('dialogs.items.delete.body'),
              {
                onConfirm: () => {
                  if (fieldPath) {
                    if (this.actor.getEmbeddedDocument('Item', id)) {
                      this.actor.deleteEmbeddedDocuments('Item', [id]);
                    } else {
                      let items = getFieldValueFromPath(this.actor.system, fieldPath);

                      items = items.filter(item => item._id !== id);

                      const dataToUpdate = {
                        system: getUpdateObjectFromPath(items, fieldPath)
                      };

                      this.actor.update(dataToUpdate);
                    }
                  }
                }
              }
            );
          }
        }
      });
    }

    const ContextMenuImpl = foundry.applications?.ux?.ContextMenu?.implementation ?? ContextMenu;
    const isV14 = !!foundry.applications?.ux?.ContextMenu?.implementation;
    return new ContextMenuImpl(
      this.element instanceof HTMLElement
        ? this.element.querySelector(containerSelector)
        : this.element.find(containerSelector)[0],
      rowSelector,
      [...otherItems],
      ...(isV14 ? [{ jQuery: false }] : [])
    );
  };

  _getLinkedEffect(item) {
    if (!item) return null;
    return this.actor.effects.find(e => e.origin === item.uuid) ?? null;
  }

  async _linkItemToEffect(item, effect) {
    if (!item || !effect) return;
    await item.setFlag('animabf', 'linkedEffectId', effect.id);
  }

  async _ensureEffectForItem(item) {
    if (!item) return null;

    const effect = this._getLinkedEffect(item);
    if (effect) return effect;

    const rawBaseData = item.system?.effectData ?? {};
    // Ignore old origin if it exists in stored data
    const { origin, ...baseData } = rawBaseData;

    const data = foundry.utils.mergeObject(
      {
        name: item.name,
        icon: item.img || 'icons/svg/aura.svg',
        disabled: !item.system?.active,
        origin: item.uuid // always the current item
      },
      baseData,
      { inplace: false }
    );

    const [created] = await this.actor.createEmbeddedDocuments('ActiveEffect', [data]);
    return created ?? null;
  }

  async _onDropItem(event, data) {
    const created = await super._onDropItem(event, data);

    const items = Array.isArray(created) ? created : created ? [created] : [];

    for (const item of items) {
      if (item.type !== ABFItems.EFFECT) continue;

      await item.update({
        'system.active': false,
        'system.effectData.disabled': true
      });

      await this._ensureEffectForItem(item);
    }

    return created;
  }

  _setupEffectSync(item, effect) {
    const handler = async (doc, diff, options, userId) => {
      if (doc.id !== effect.id) return;
      if (userId !== game.user.id) return;

      if (doc.transfer === true) {
        await doc.update({ transfer: false });
        return;
      }

      const obj = doc.toObject();
      const { _id, _key, parent, ...clean } = obj;

      await item.update({ 'system.effectData': clean });
      await item.update({ 'system.active': !doc.disabled });

      Hooks.off('updateActiveEffect', handler);
    };

    Hooks.on('updateActiveEffect', handler);
  }
}
