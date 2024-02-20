import { openModDialog } from '../utils/dialogs/openSimpleInputDialog';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll';
import { splitAsActorAndItemChanges } from './utils/splitAsActorAndItemChanges';
import { unflat } from './utils/unflat';
import { ALL_ITEM_CONFIGURATIONS } from './utils/prepareItems/constants';
import { getFieldValueFromPath } from './utils/prepareItems/util/getFieldValueFromPath';
import { getUpdateObjectFromPath } from './utils/prepareItems/util/getUpdateObjectFromPath';
import { ABFItems } from '../items/ABFItems';
import { ABFDialogs } from '../dialogs/ABFDialogs';

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
        classes: ['abf', 'sheet', 'actor'],
        template: 'systems/animabf/templates/actor/actor-sheet.hbs',
        width: 1000,
        height: 850,
        submitOnChange: true,
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

    return 1000;
  }

  async getData(options) {
    const sheet = await super.getData(options);

    if (this.actor.type === 'character') {
      await sheet.actor.prepareDerivedData();

      sheet.system = sheet.actor.system;
    }

    sheet.config = CONFIG.config;

    sheet.effects = sheet.actor.getEmbeddedCollection('ActiveEffect').contents;

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

    html.find('.effect-control').click(this._onEffectControl.bind(this));

    html.find('.toggle-effects-button').click(async e => {
      const { effectsItemId } = e.currentTarget.dataset;
      const item = this.actor.items.get(effectsItemId);
      const effects = this.actor.getEmbeddedCollection('ActiveEffect').contents;
      const relevantEffects = effects.filter(effect =>
        effect.origin.endsWith(effectsItemId)
      );

      if (relevantEffects.length === 0) {
        return;
      }

      const newStatus = !item.system.activeEffect.enabled;

      for (const effect of relevantEffects) {
        await effect.update({ disabled: !newStatus });
      }
      return item.update({ 'system.activeEffect.enabled': newStatus });
    });

    for (const item of Object.values(ALL_ITEM_CONFIGURATIONS)) {
      this.buildCommonContextualMenu(item);

      html.find(item.selectors.rowSelector).each((_, row) => {
        // Add draggable attribute and dragstart listener.
        row.setAttribute('draggable', 'true');
        row.addEventListener('dragstart', handler, false);
      });

      html.find(`[data-on-click="${item.selectors.addItemButtonSelector}"]`).click(() => {
        item.onCreate(this.actor);
      });
    }
  }

  _onEffectControl(event) {
    event.preventDefault();
    const owner = this.actor;
    const a = event.currentTarget;
    const tr = a.closest('tr');
    const effect = tr.dataset.effectId ? owner.effects.get(tr.dataset.effectId) : null;
    const status = effect?.disabled
    switch (a.dataset.action) {
      case 'create':
        return owner.createEmbeddedDocuments('ActiveEffect', [
          {
            name: 'New Effect',
            icon: 'icons/svg/aura.svg',
            origin: owner.uuid,
            disable: true
          }
        ]);
      case 'toggle':
        return effect.update({ disabled: !status });
      case 'edit':
        return effect.sheet.render(true);
      case 'delete':
        return effect.delete();
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
      if (parseInt(dataset.extra) >= 200) formula = formula.replace('xa', 'xamastery');
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
              console.warn('Item sheet was not found for item:', item);
            }
          } else {
            console.warn('Item ID was not found for target:', target);
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
            console.warn(
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

    return new ContextMenu($(containerSelector), rowSelector, [...otherItems]);
  };
}
