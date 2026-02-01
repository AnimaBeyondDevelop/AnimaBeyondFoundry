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

/** @typedef {import('./constants').TActorData} TData */
/** @typedef {typeof FormApplication<FormApplicationOptions, TData, TData>} TFormApplication */
export default class ABFActorSheet extends ActorSheet {
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
        submitOnChange: true,
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

  async close(options) {
    super.close(options);

    this.position.width = this.getWidthDependingFromContent();
  }

  getWidthDependingFromContent() {
    if (this.actor.items.filter(i => i.type === ABFItems.SPELL).length > 0) {
      return 1300;
    }

    return 1100;
  }

  async _render(force, options = {}) {
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

    const actor = this.actor; // use the real Document, not sheet.actor

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

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    const handler = ev => this._onDragStart(ev);

    // Find all items on the character sheet.

    // Rollable abilities.
    html.find('.rollable').click(e => {
      this._onRoll(e);
    });

    html.find('.contractible-button').click(e => {
      const { contractibleItemId } = e.currentTarget.dataset;

      if (contractibleItemId) {
        const ui = this.actor.system.ui;

        ui.contractibleItems = {
          ...ui.contractibleItems,
          [contractibleItemId]: !ui.contractibleItems[contractibleItemId]
        };

        this.actor.update({ system: { ui } });
      }
    });

    for (const item of Object.values(ALL_ITEM_CONFIGURATIONS)) {
      this.buildCommonContextualMenu(item);

      html.find(item.selectors.rowSelector).each((_, row) => {
        // Add draggable attribute and dragstart listener.
        row.setAttribute('draggable', 'true');
        row.addEventListener('dragstart', handler, false);
      });

      //Buttons cllback from hbs
      html.find(`[data-on-click="${item.selectors.addItemButtonSelector}"]`).click(() => {
        item.onCreate(this.actor);
      });
    }

    const clickHandlers = createClickHandlers(this);

    html.find('[data-on-click]').click(e => {
      const key = e.currentTarget.dataset.onClick;
      const handler = clickHandlers[key];
      if (handler) handler(e);
      else console.warn(`No handler for data-on-click="${key}"`);
    });

    html.find('.effect-control').click(this._onEffectControl.bind(this));
  }

  async _onEffectControl(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const action = a.dataset.action;
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

        return;
      }

      default:
        return;
    }
  }

  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const { dataset } = element;

    if (dataset.roll) {
      const label = dataset.label ? `Rolling ${dataset.label}` : '';
      const mod = await openModDialog();
      let formula = `${dataset.roll}+ ${mod}`;
      if (parseInt(dataset.extra) >= 200) {
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

  protected;

  async _updateObject(event, formData) {
    // We have to parse all qualities in order to convert from it selectable to integers to make calculations
    Object.keys(formData).forEach(key => {
      if (key.includes('quality')) {
        formData[key] = parseInt(formData[key], 10);
      }
    });

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
        icon: '<i class="fas fa-edit fa-fw"></i>',
        callback: target => {
          const { itemId } = target[0].dataset;

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
        icon: '<i class="fas fa-trash fa-fw"></i>',
        callback: target => {
          if (!customCallbackFn && !fieldPath) {
            Logger.warn(
              `buildCommonContextualMenu: no custom callback and configuration set, could not delete the item: ${itemConfig.type}`
            );
          }

          if (customCallbackFn) {
            customCallbackFn(this.actor, target);
          } else {
            const id = target[0].dataset.itemId;

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

    return new ContextMenu(this.element.find(containerSelector), rowSelector, [
      ...otherItems
    ]);
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

    let effect = this._getLinkedEffect(item);
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
