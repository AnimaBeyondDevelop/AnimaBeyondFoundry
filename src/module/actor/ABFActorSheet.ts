import { openModDialog } from '../utils/openDialog';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll';
import { ABFActor } from './ABFActor';
import { splitAsActorAndItemChanges } from './utils/splitAsActorAndItemChanges';
import { ABFItemConfig, DynamicChanges, ItemChanges } from '../types/Items';
import { unflat } from '../../utils/unflat';
import { ALL_ITEM_CONFIGURATIONS } from './utils/prepareSheet/prepareItems/constants';
import { getFieldValueFromPath } from './utils/prepareSheet/prepareItems/util/getFieldValueFromPath';
import { getUpdateObjectFromPath } from './utils/prepareSheet/prepareItems/util/getUpdateObjectFromPath';
import { ABFItems } from './utils/prepareSheet/prepareItems/ABFItems';
import { ABFConfig } from '../ABFConfig';

export default class ABFActorSheet extends ActorSheet {
  i18n: Localization;

  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      ...{
        classes: ['abf', 'sheet', 'actor'],
        template: 'systems/animabf/templates/actor/actor-sheet.hbs',
        width: 900,
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
          }
        ]
      }
    };
  }

  constructor(actor: ABFActor, options?: Partial<ActorSheet.Options>) {
    super(actor, options);

    this.i18n = (game as Game).i18n;

    this.position.width = this.getWidthDependingFromContent();
  }

  async close(options?: FormApplication.CloseOptions): Promise<void> {
    super.close(options);

    this.position.width = this.getWidthDependingFromContent();
  }

  getWidthDependingFromContent(): number {
    if (this.actor.items.filter(i => i.type === ABFItems.SPELL).length > 0) {
      return 1300;
    }

    return 900;
  }

  getData() {
    const data = super.getData() as ActorSheet.Data & { config?: typeof ABFConfig };

    if (this.actor.data.type === 'character') {
      data.actor.prepareDerivedData();

      // Yes, a lot of datas, I know. This is Foundry VTT, welcome if you see this
      data.data.data = data.actor.data.data;
    }

    data.config = CONFIG.config;

    return data;
  }

  protected async _updateObject(event: Event, formData: Record<string, unknown>): Promise<ABFActor | undefined> {
    const [actorChanges, itemChanges] = splitAsActorAndItemChanges(formData);

    await this.updateItems(itemChanges);

    return super._updateObject(event, actorChanges);
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Rollable abilities.
    html.find('.rollable').click(e => {
      this._onRoll(e);
    });

    for (const item of Object.values(ALL_ITEM_CONFIGURATIONS)) {
      this.buildCommonContextualMenu(item);

      html.find(`[data-on-click="${item.selectors.addItemButtonSelector}"]`).click(() => {
        item.onCreate(this.actor);
      });
    }

    html.find('[data-on-click="delete-item"]').click(e => {
      const id = e.currentTarget.dataset.itemId;
      if (id) {
        WorldCollection.instance.delete(id);
      } else {
        console.warn(
          'Trying to delete a dynamic item but data-item-id was not set to the button. Cant delete the item.'
        );
      }
    });
  }

  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const { dataset } = element;

    if (dataset.roll) {
      const label = dataset.label ? `Rolling ${dataset.label}` : '';
      const mod = await openModDialog();
      const formula = `${dataset.roll}+ ${mod}`;
      const roll = new ABFFoundryRoll(formula, this.actor.data.data);

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  private async updateItems(_changes: Record<string, unknown>) {
    if (!_changes || Object.keys(_changes).length === 0) return;

    const changes: DynamicChanges = unflat(_changes);

    for (const item of Object.values(ALL_ITEM_CONFIGURATIONS)) {
      if (item.getFromDynamicChanges(changes)) {
        await item.onUpdate(this.actor, item.getFromDynamicChanges(changes) as any);
      }
    }
  }

  private buildCommonContextualMenu = (itemConfig: ABFItemConfig<unknown, ItemChanges<unknown>>) => {
    const {
      selectors: { containerSelector, rowSelector },
      fieldPath
    } = itemConfig;

    const deleteRowMessage =
      itemConfig.contextMenuConfig?.customDeleteRowMessage ??
      this.i18n.localize('contextualMenu.common.options.delete');

    const customCallbackFn = itemConfig.onDelete;

    const otherItems = itemConfig.contextMenuConfig?.buildExtraOptionsInContextMenu?.(this.actor) ?? [];

    if (!itemConfig.isInternal && itemConfig.hasSheet) {
      otherItems.push({
        name: 'Editar',
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

    return new ContextMenu($(containerSelector), rowSelector, [
      {
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
              throw new Error('Data id missing. Are you sure to set data-item-id to rows?');
            }

            if (fieldPath) {
              if (this.actor.getEmbeddedDocument('Item', id)) {
                this.actor.deleteEmbeddedDocuments('Item', [id]);
              } else {
                let items = getFieldValueFromPath<any[]>(this.actor.data.data, fieldPath);

                items = items.filter(item => item._id !== id);

                const dataToUpdate: any = {
                  data: getUpdateObjectFromPath(items, fieldPath)
                };

                this.actor.update(dataToUpdate);
              }
            }
          }
        }
      },
      ...otherItems
    ]);
  };
}
