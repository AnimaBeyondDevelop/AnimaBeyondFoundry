import { openModDialog } from '../utils/openDialog';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll';
import { ABFActor } from './ABFActor';
import { splitAsActorAndItemChanges } from './utils/splitAsActorAndItemChanges';
import { ABFItemConfig, DynamicChanges, ItemChanges } from '../types/Items';
import { unflat } from '../../utils/unflat';
import { ALL_ITEM_CONFIGURATIONS } from './utils/prepareSheet/prepareItems/constants';
import { prepareSheet } from './utils/prepareSheet/prepareSheet';
import { getFieldValueFromPath } from './utils/prepareSheet/prepareItems/util/getFieldValueFromPath';
import { getUpdateObjectFromPath } from './utils/prepareSheet/prepareItems/util/getUpdateObjectFromPath';

export default class ABFActorSheet extends ActorSheet {
  i18n: Localization;

  constructor(object: ABFActor) {
    super(object, {});

    this.i18n = (game as Game).i18n;
  }

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
          }
        ]
      }
    };
  }

  getData() {
    const data = super.getData() as ActorSheet.Data;

    if (this.actor.data.type === 'character') {
      return prepareSheet(data);
    }

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
      selectors: { containerSelector, rowSelector, rowIdData },
      fieldPath
    } = itemConfig;

    const deleteRowMessage =
      itemConfig.contextMenuConfig?.customDeleteRowMessage ??
      this.i18n.localize('contextualMenu.common.options.delete');

    const customCallbackFn = itemConfig.onDelete;

    const otherItems = itemConfig.contextMenuConfig?.buildExtraOptionsInContextMenu?.(this.actor) ?? [];

    return new ContextMenu($(containerSelector), rowSelector, [
      {
        name: deleteRowMessage,
        icon: '<i class="fas fa-trash fa-fw"></i>',
        callback: target => {
          if (!customCallbackFn && !fieldPath) {
            console.warn(
              `buildCommonContextualMenu: no custom callback and configuration set, could not delete the item: ${rowIdData}`
            );
          }

          if (customCallbackFn) {
            customCallbackFn(this.actor, target);
          } else {
            const id = target[0].dataset[rowIdData];

            if (!id) {
              throw new Error(
                `Data id missing. Are you sure to set ${rowIdData} in snake middle case to rows? example: data-elan-id`
              );
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
