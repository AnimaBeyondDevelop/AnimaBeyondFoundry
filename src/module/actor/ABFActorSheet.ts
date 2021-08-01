import { openModDialog } from '../utils/openDialog';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll';
import { ABFActor } from './ABFActor';
import { prepareSheet } from './utils/prepareSheet/prepareSheet';
import { splitAsActorAndItemChanges } from './utils/splitAsActorAndItemChanges';
import { ItemChanges } from '../types/ItemChanges';
import { unflat } from '../../utils/unflat';

export default class ABFActorSheet extends ActorSheet<ActorSheet.Data<ABFActor>> {
  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      ...{
        classes: ['abf', 'sheet', 'actor'],
        template: 'systems/animabf/templates/actor-sheet.html',
        width: 600,
        height: 700,
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

  getData(): ActorSheet.Data<ABFActor> {
    const data = super.getData() as ActorSheet.Data<ABFActor>;

    if (this.actor.data.type === 'character') {
      return prepareSheet(data);
    }

    return data;
  }

  protected async _updateObject(
    event: Event,
    formData: Record<string, unknown>
  ): Promise<ABFActor> {
    const [actorChanges, itemChanges] = splitAsActorAndItemChanges(formData);

    await this.updateItems(itemChanges);

    return super._updateObject(event, actorChanges);
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    html.find('[data-on-click="add-secondary-skill"]').click(() => {
      this.actor.addSecondarySkillSlot();
    });

    html.find('[data-on-click="add-free-access-spell"]').click(() => {
      this.actor.addFreeAccessSpellSlot();
    });

    html.find('[data-on-click="add-maintenance"]').click(() => {
      this.actor.addMaintentances();
    });

    html.find('[data-on-click="add-selected"]').click(() => {
      this.actor.addSelectedSpells();
    });

    html.find('[data-on-click="add-invocation"]').click(() => {
      this.actor.addInvocation();
    });

    html.find('[data-on-click="add-metamagic"]').click(() => {
      this.actor.addMetamagic();
    });

    // Level
    this.buildCommonContextualMenu({
      containerSelector: '#level-context-menu-container',
      rowSelector: '.level-row',
      rowIdData: 'levelId'
    });

    html.find('[data-on-click="add-level"]').click(() => {
      this.actor.addLevel();
    });
    // Level

    // Language
    this.buildCommonContextualMenu({
      containerSelector: '#language-context-menu-container',
      rowSelector: '.language-row',
      rowIdData: 'languageId'
    });

    html.find('[data-on-click="add-language"]').click(() => {
      this.actor.addLanguage();
    });
    // Language

    // Elan
    this.buildCommonContextualMenu({
      containerSelector: '#elan-context-menu-container',
      rowSelector: '.elan-row',
      rowIdData: 'elanId',
      otherItems: [
        {
          name: game.i18n.localize('contextualMenu.elan.options.addPower'),
          icon: '<i class="fa fa-plus" aria-hidden="true"></i>',
          callback: target => {
            const { elanId } = target[0].dataset;

            if (!elanId) throw new Error('elanId missing');

            this.actor.addElanPower(elanId);
          }
        }
      ]
    });

    html.find('[data-on-click="add-elan"]').click(() => {
      this.actor.addElan();
    });
    // Elan

    // Titles
    this.buildCommonContextualMenu({
      containerSelector: '#title-context-menu-container',
      rowSelector: '.title-row',
      rowIdData: 'titleId'
    });

    html.find('[data-on-click="add-title"]').click(() => {
      this.actor.addTitle();
    });
    // Titles

    // Advantages
    this.buildCommonContextualMenu({
      containerSelector: '#advantage-context-menu-container',
      rowSelector: '.advantage-row',
      rowIdData: 'advantageId'
    });

    html.find('[data-on-click="add-advantage"]').click(() => {
      this.actor.addAdvantage();
    });
    // Advantages

    // Disadvantages
    this.buildCommonContextualMenu({
      containerSelector: '#disadvantage-context-menu-container',
      rowSelector: '.disadvantage-row',
      rowIdData: 'disadvantageId'
    });

    html.find('[data-on-click="add-disadvantage"]').click(() => {
      this.actor.addDisadvantage();
    });
    // Disadvantages

    // Contacts
    this.buildCommonContextualMenu({
      containerSelector: '#contact-context-menu-container',
      rowSelector: '.contact-row',
      rowIdData: 'contactId'
    });

    html.find('[data-on-click="add-contact"]').click(() => {
      this.actor.addContact();
    });
    // Contacts

    // Notes
    this.buildCommonContextualMenu({
      containerSelector: '#note-context-menu-container',
      rowSelector: '.note-row',
      rowIdData: 'noteId'
    });

    html.find('[data-on-click="add-note"]').click(() => {
      this.actor.addNote();
    });
    // Notes

    html.find('[data-on-click="delete-item"]').click(e => {
      const id = e.currentTarget.dataset.itemId;
      if (id) {
        this.actor.deleteOwnedItem(id);
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

  private async updateItems(itemChanges: Record<string, unknown>) {
    if (!itemChanges || Object.keys(itemChanges).length === 0) return;

    const unflattedChanges: ItemChanges = unflat(itemChanges);

    if (unflattedChanges.data.dynamic.skill) {
      this.actor.editSecondarySkills(unflattedChanges.data.dynamic.skill);
    }

    if (unflattedChanges.data.dynamic.freeAccessSpells) {
      this.actor.editFreeAccessSpells(unflattedChanges.data.dynamic.freeAccessSpells);
    }

    if (unflattedChanges.data.dynamic.maintenances) {
      this.actor.editMaintentances(unflattedChanges.data.dynamic.maintenances);
    }

    if (unflattedChanges.data.dynamic.selected) {
      this.actor.editSelectedSpells(unflattedChanges.data.dynamic.selected);
    }

    if (unflattedChanges.data.dynamic.invocation) {
      this.actor.editInvocation(unflattedChanges.data.dynamic.invocation);
    }

    if (unflattedChanges.data.dynamic.metamagic) {
      this.actor.editMetamagic(unflattedChanges.data.dynamic.metamagic);
    }

    if (unflattedChanges.data.dynamic.levels) {
      this.actor.editLevel(unflattedChanges.data.dynamic.levels);
    }

    if (unflattedChanges.data.dynamic.other_languages) {
      this.actor.editLanguage(unflattedChanges.data.dynamic.other_languages);
    }

    if (unflattedChanges.data.dynamic.elan) {
      this.actor.editElan(unflattedChanges.data.dynamic.elan);
    }

    if (unflattedChanges.data.dynamic.elan_power) {
      await this.actor.editElanPower(unflattedChanges.data.dynamic.elan_power);
    }

    if (unflattedChanges.data.dynamic.titles) {
      await this.actor.editTitles(unflattedChanges.data.dynamic.titles);
    }

    if (unflattedChanges.data.dynamic.advantages) {
      await this.actor.editAdvantages(unflattedChanges.data.dynamic.advantages);
    }

    if (unflattedChanges.data.dynamic.disadvantages) {
      await this.actor.editDisadvantages(unflattedChanges.data.dynamic.disadvantages);
    }

    if (unflattedChanges.data.dynamic.contacts) {
      await this.actor.editContacts(unflattedChanges.data.dynamic.contacts);
    }

    if (unflattedChanges.data.dynamic.notes) {
      await this.actor.editNotes(unflattedChanges.data.dynamic.notes);
    }
  }

  private buildCommonContextualMenu = ({
    containerSelector,
    rowSelector,
    rowIdData,
    otherItems = []
  }: {
    containerSelector: string;
    rowSelector: string;
    rowIdData: string;
    otherItems?: ContextMenu.Item[];
  }) => {
    return new ContextMenu($(containerSelector), rowSelector, [
      {
        name: game.i18n.localize('contextualMenu.common.options.delete'),
        icon: '<i class="fas fa-trash fa-fw"></i>',
        callback: target => {
          const id = target[0].dataset[rowIdData];

          if (!id) {
            throw new Error(
              `Data id missing. Are you sure to set data-${rowIdData} to rows?`
            );
          }

          this.actor.deleteOwnedItem(id);
        }
      },
      ...otherItems
    ]);
  };
}