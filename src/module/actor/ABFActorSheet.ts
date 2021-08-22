import { openModDialog } from '../utils/openDialog';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll';
import { ABFActor } from './ABFActor';
import { splitAsActorAndItemChanges } from './utils/splitAsActorAndItemChanges';
import { ItemChanges } from '../types/ItemChanges';
import { unflat } from '../../utils/unflat';
import {
  ATTACH_CONFIGURATIONS,
  AttachConfiguration
} from './utils/prepareSheet/prepareItems/constants';
import { ABFItems } from './utils/prepareSheet/prepareItems/ABFItems';
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
        template: 'systems/animabf/templates/actor-sheet.hbs',
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

    console.trace();
    if (this.actor.data.type === 'character') {
      return prepareSheet(data);
    }

    return data;
  }

  protected async _updateObject(
    event: Event,
    formData: Record<string, unknown>
  ): Promise<ABFActor | undefined> {
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

    // Free Access Spells
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.FREE_ACCESS_SPELL],
      containerSelector: '#free-access-spells-context-menu-container',
      rowSelector: '.free-access-spell-row',
      rowIdData: 'freeAccessSpellId'
    });

    html.find('[data-on-click="add-free-access-spell"]').click(() => {
      this.actor.addFreeAccessSpell();
    });
    // Free Access Spells

    // Spell Maintenances
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.SPELL_MAINTENANCE],
      containerSelector: '#spell-maintenances-context-menu-container',
      rowSelector: '.spell-maintenance-row',
      rowIdData: 'spellMaintenanceId'
    });

    html.find('[data-on-click="add-spell-maintenance"]').click(() => {
      this.actor.addSpellMaintenance();
    });
    // Spell Maintenances

    // Selected Spells
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.SELECTED_SPELL],
      containerSelector: '#selected-spells-context-menu-container',
      rowSelector: '.selected-spell-row',
      rowIdData: 'selectedSpellId'
    });

    html.find('[data-on-click="add-selected-spell"]').click(() => {
      this.actor.addSelectedSpell();
    });
    // Selected Spells

    // Summons
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.SUMMON],
      containerSelector: '#summons-context-menu-container',
      rowSelector: '.summon-row',
      rowIdData: 'summonId'
    });

    html.find('[data-on-click="add-summon"]').click(() => {
      this.actor.addSummon();
    });
    // Summons

    // Metamagic
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.METAMAGIC],
      containerSelector: '#metamagics-context-menu-container',
      rowSelector: '.metamagic-row',
      rowIdData: 'metamagicId'
    });

    html.find('[data-on-click="add-metamagic"]').click(() => {
      this.actor.addMetamagic();
    });
    // Metamagic

    // Level
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.LEVEL],
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
      configuration: ATTACH_CONFIGURATIONS[ABFItems.LANGUAGE],
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
      configuration: ATTACH_CONFIGURATIONS[ABFItems.ELAN],
      containerSelector: '#elan-context-menu-container',
      rowSelector: '.elan-row .base',
      rowIdData: 'elanId',
      otherItems: [
        {
          name: this.i18n.localize('contextualMenu.elan.options.addPower'),
          icon: '<i class="fa fa-plus" aria-hidden="true"></i>',
          callback: target => {
            const { elanId } = target[0].dataset;

            if (!elanId) throw new Error('elanId missing');

            this.actor.addElanPower(elanId);
          }
        }
      ]
    });

    this.buildCommonContextualMenu({
      containerSelector: '#elan-context-menu-container',
      rowSelector: '.elan-row .powers',
      rowIdData: 'elanPowerId',
      deleteRowMessage: this.i18n.localize('contextualMenu.elan.options.deletePower'),
      customCallbackFn: target => {
        const { elanId } = target[0].dataset;

        if (!elanId) {
          throw new Error('Data id missing. Are you sure to set data-elan-id to rows?');
        }

        const { elanPowerId } = target[0].dataset;

        if (!elanPowerId) {
          throw new Error(
            'Data id missing. Are you sure to set data-elan-power-id to rows?'
          );
        }

        this.actor.removeElanPower(elanId, elanPowerId);
      }
    });

    html.find('[data-on-click="add-elan"]').click(() => {
      this.actor.addElan();
    });
    // Elan

    // Titles
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.TITLE],
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
      configuration: ATTACH_CONFIGURATIONS[ABFItems.ADVANTAGE],
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
      configuration: ATTACH_CONFIGURATIONS[ABFItems.DISADVANTAGE],
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
      configuration: ATTACH_CONFIGURATIONS[ABFItems.CONTACT],
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
      configuration: ATTACH_CONFIGURATIONS[ABFItems.NOTE],
      containerSelector: '#note-context-menu-container',
      rowSelector: '.note-row',
      rowIdData: 'noteId'
    });

    html.find('[data-on-click="add-note"]').click(() => {
      this.actor.addNote();
    });
    // Notes

    // Psychic Disciplines
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.PSYCHIC_DISCIPLINE],
      containerSelector: '#psychic-disciplines-context-menu-container',
      rowSelector: '.psychic-discipline-row',
      rowIdData: 'psychicDisciplineId'
    });

    html.find('[data-on-click="add-psychic-discipline"]').click(() => {
      this.actor.addPsychicDiscipline();
    });
    // Psychic Disciplines

    // Mental Patterns
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.MENTAL_PATTERN],
      containerSelector: '#mental-patterns-context-menu-container',
      rowSelector: '.mental-pattern-row',
      rowIdData: 'mentalPatternId'
    });

    html.find('[data-on-click="add-mental-pattern"]').click(() => {
      this.actor.addMentalPattern();
    });
    // Mental Patterns

    // Innate Psychic Powers
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.INNATE_PSYCHIC_POWER],
      containerSelector: '#innate-psychic-powers-context-menu-container',
      rowSelector: '.innate-psychic-power-row',
      rowIdData: 'innatePsychicPowerId'
    });

    html.find('[data-on-click="add-innate-psychic-power"]').click(() => {
      this.actor.addInnatePsychicPower();
    });
    // Innate Psychic Powers

    // Psychic Powers
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.PSYCHIC_POWER],
      containerSelector: '#psychic-powers-context-menu-container',
      rowSelector: '.psychic-power-row',
      rowIdData: 'psychicPowerId'
    });

    html.find('[data-on-click="add-psychic-power"]').click(() => {
      this.actor.addPsychicPower();
    });
    // Psychic Powers

    // Ki Skills
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.KI_SKILL],
      containerSelector: '#ki-skills-context-menu-container',
      rowSelector: '.ki-skill-row',
      rowIdData: 'kiSkillId'
    });

    html.find('[data-on-click="add-ki-skill"]').click(() => {
      this.actor.addKiSkill();
    });
    // Ki Skills

    // Nemesis Skills
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.NEMESIS_SKILL],
      containerSelector: '#nemesis-skills-context-menu-container',
      rowSelector: '.nemesis-skill-row',
      rowIdData: 'nemesisSkillId'
    });

    html.find('[data-on-click="add-nemesis-skill"]').click(() => {
      this.actor.addNemesisSkill();
    });
    // Nemesis Skills

    // Ars Magnus
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.ARS_MAGNUS],
      containerSelector: '#ars-magnus-context-menu-container',
      rowSelector: '.ars-magnus-row',
      rowIdData: 'arsMagnusId'
    });

    html.find('[data-on-click="add-ars-magnus"]').click(() => {
      this.actor.addArsMagnus();
    });
    // Ars Magnus

    // Martial Arts
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.MARTIAL_ART],
      containerSelector: '#martial-arts-context-menu-container',
      rowSelector: '.martial-art-row',
      rowIdData: 'martialArtId'
    });

    html.find('[data-on-click="add-martial-art"]').click(() => {
      this.actor.addMartialArt();
    });
    // Martial Arts

    // Creatures
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.CREATURE],
      containerSelector: '#creatures-context-menu-container',
      rowSelector: '.creature-row',
      rowIdData: 'creatureId'
    });

    html.find('[data-on-click="add-creature"]').click(() => {
      this.actor.addCreature();
    });
    // Creatures

    // Special Skills
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.SPECIAL_SKILL],
      containerSelector: '#special-skills-context-menu-container',
      rowSelector: '.special-skill-row',
      rowIdData: 'specialSkillId'
    });

    html.find('[data-on-click="add-special-skill"]').click(() => {
      this.actor.addSpecialSkill();
    });
    // Special Skills

    // Techniques
    this.buildCommonContextualMenu({
      configuration: ATTACH_CONFIGURATIONS[ABFItems.TECHNIQUE],
      containerSelector: '#techniques-context-menu-container',
      rowSelector: '.technique-row',
      rowIdData: 'techniqueId'
    });

    html.find('[data-on-click="add-technique"]').click(() => {
      this.actor.addTechnique();
    });
    // Techniques

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
      const roll = new ABFFoundryRoll(formula, this.actor.data.data as any);

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
      await this.actor.editSecondarySkills(unflattedChanges.data.dynamic.skill);
    }

    if (unflattedChanges.data.dynamic.freeAccessSpells) {
      await this.actor.editFreeAccessSpells(unflattedChanges.data.dynamic.freeAccessSpells);
    }

    if (unflattedChanges.data.dynamic.spellMaintenances) {
      await this.actor.editSpellMaintenance(unflattedChanges.data.dynamic.spellMaintenances);
    }

    if (unflattedChanges.data.dynamic.selectedSpells) {
      await this.actor.editSelectedSpell(unflattedChanges.data.dynamic.selectedSpells);
    }

    if (unflattedChanges.data.dynamic.summons) {
      await this.actor.editSummon(unflattedChanges.data.dynamic.summons);
    }

    if (unflattedChanges.data.dynamic.metamagics) {
      await this.actor.editMetamagic(unflattedChanges.data.dynamic.metamagics);
    }

    if (unflattedChanges.data.dynamic.levels) {
      await this.actor.editLevel(unflattedChanges.data.dynamic.levels);
    }

    if (unflattedChanges.data.dynamic.other_languages) {
      await this.actor.editLanguage(unflattedChanges.data.dynamic.other_languages);
    }

    if (unflattedChanges.data.dynamic.elan) {
      await this.actor.editElan(unflattedChanges.data.dynamic.elan);
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

    if (unflattedChanges.data.dynamic.psychicDisciplines) {
      await this.actor.editPsychicDisciplines(unflattedChanges.data.dynamic.psychicDisciplines);
    }

    if (unflattedChanges.data.dynamic.mentalPatterns) {
      await this.actor.editMentalPatterns(unflattedChanges.data.dynamic.mentalPatterns);
    }

    if (unflattedChanges.data.dynamic.innatePsychicPowers) {
      await this.actor.editInnatePsychicPowers(
        unflattedChanges.data.dynamic.innatePsychicPowers
      );
    }

    if (unflattedChanges.data.dynamic.psychicPowers) {
      await this.actor.editPsychicPowers(unflattedChanges.data.dynamic.psychicPowers);
    }

    if (unflattedChanges.data.dynamic.kiSkills) {
      await this.actor.editKiSkills(unflattedChanges.data.dynamic.kiSkills);
    }

    if (unflattedChanges.data.dynamic.nemesisSkills) {
      await this.actor.editNemesisSkills(unflattedChanges.data.dynamic.nemesisSkills);
    }

    if (unflattedChanges.data.dynamic.arsMagnus) {
      await this.actor.editArsMagnus(unflattedChanges.data.dynamic.arsMagnus);
    }

    if (unflattedChanges.data.dynamic.martialArts) {
      await this.actor.editMartialArts(unflattedChanges.data.dynamic.martialArts);
    }

    if (unflattedChanges.data.dynamic.creatures) {
      await this.actor.editCreatures(unflattedChanges.data.dynamic.creatures);
    }

    if (unflattedChanges.data.dynamic.specialSkills) {
      await this.actor.editSpecialSkills(unflattedChanges.data.dynamic.specialSkills);
    }

    if (unflattedChanges.data.dynamic.techniques) {
      await this.actor.editTechniques(unflattedChanges.data.dynamic.techniques);
    }
  }

  private buildCommonContextualMenu = ({
    configuration,
    containerSelector,
    rowSelector,
    rowIdData,
    deleteRowMessage = this.i18n.localize('contextualMenu.common.options.delete'),
    customCallbackFn,
    otherItems = []
  }: {
    configuration?: AttachConfiguration;
    containerSelector: string;
    rowSelector: string;
    rowIdData: string;
    deleteRowMessage?: string;
    customCallbackFn?: (target: JQuery) => void;
    otherItems?: ContextMenu.Item[];
  }) => {
    return new ContextMenu($(containerSelector), rowSelector, [
      {
        name: deleteRowMessage,
        icon: '<i class="fas fa-trash fa-fw"></i>',
        callback: target => {
          if (customCallbackFn) {
            customCallbackFn(target);
          } else {
            const id = target[0].dataset[rowIdData];

            if (!id) {
              throw new Error(
                `Data id missing. Are you sure to set ${rowIdData} in snake middle case to rows? example: data-elan-id`
              );
            }

            if (configuration) {
              let items = getFieldValueFromPath<any[]>(
                this.actor.data.data,
                configuration.fieldPath
              );

              items = items.filter(item => item._id !== id);

              const dataToUpdate: any = {
                data: getUpdateObjectFromPath(items, configuration.fieldPath)
              };

              if (this.actor.getEmbeddedDocument('Item', id)) {
                this.actor.deleteEmbeddedDocuments('Item', [id]);
              }

              this.actor.update(dataToUpdate);
            }
          }
        }
      },
      ...otherItems
    ]);
  };
}
