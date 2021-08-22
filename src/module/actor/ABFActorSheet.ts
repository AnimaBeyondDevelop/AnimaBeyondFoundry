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

    // Free Access Spells
    this.buildCommonContextualMenu({
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
      rowSelector: '.elan-row .base',
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

    this.buildCommonContextualMenu({
      containerSelector: '#elan-context-menu-container',
      rowSelector: '.elan-row .powers',
      rowIdData: 'elanPowerId',
      deleteRowMessage: game.i18n.localize('contextualMenu.elan.options.deletePower'),
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

    // Psychic Disciplines
    this.buildCommonContextualMenu({
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
      containerSelector: '#techniques-context-menu-container',
      rowSelector: '.technique-row',
      rowIdData: 'techniqueId'
    });

    html.find('[data-on-click="add-technique"]').click(() => {
      this.actor.addTechnique();
    });
    // Techniques

    // CombarSpecialSkills
    this.buildCommonContextualMenu({
      containerSelector: '#combat-special-skill-context-menu-container',
      rowSelector: '.combat-special-skill-row',
      rowIdData: 'combatSpecialSkillId'
    });

    html.find('[data-on-click="add-combat-special-skill"]').click(() => {
      this.actor.addCombatSpecialSkill();
    });
    // CombatSpecialskills

    // CombatTables
    this.buildCommonContextualMenu({
      containerSelector: '#combat-table-context-menu-container',
      rowSelector: '.combat-table-skill-row',
      rowIdData: 'combatTableId'
    });

    html.find('[data-on-click="add-combat-table"]').click(() => {
      this.actor.addCombatTable();
    });
    // combatTables

    // Ammo
    this.buildCommonContextualMenu({
      containerSelector: '#ammo-context-menu-container',
      rowSelector: '.ammo-row',
      rowIdData: 'ammoId'
    });

    html.find('[data-on-click="add-ammo"]').click(() => {
      this.actor.addAmmo();
    });
    // Ammo

    // Weapon
    this.buildCommonContextualMenu({
      containerSelector: '#weapon-context-menu-container',
      rowSelector: '.weapon-row',
      rowIdData: 'weaponId'
    });

    html.find('[data-on-click="add-weapon"]').click(() => {
      this.actor.addWeapon();
    });
    // Weapon

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

    if (unflattedChanges.data.dynamic.spellMaintenances) {
      this.actor.editSpellMaintenance(unflattedChanges.data.dynamic.spellMaintenances);
    }

    if (unflattedChanges.data.dynamic.selectedSpells) {
      this.actor.editSelectedSpell(unflattedChanges.data.dynamic.selectedSpells);
    }

    if (unflattedChanges.data.dynamic.summons) {
      this.actor.editSummon(unflattedChanges.data.dynamic.summons);
    }

    if (unflattedChanges.data.dynamic.metamagics) {
      this.actor.editMetamagic(unflattedChanges.data.dynamic.metamagics);
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
      this.actor.editTitles(unflattedChanges.data.dynamic.titles);
    }

    if (unflattedChanges.data.dynamic.advantages) {
      this.actor.editAdvantages(unflattedChanges.data.dynamic.advantages);
    }

    if (unflattedChanges.data.dynamic.disadvantages) {
      this.actor.editDisadvantages(unflattedChanges.data.dynamic.disadvantages);
    }

    if (unflattedChanges.data.dynamic.contacts) {
      this.actor.editContacts(unflattedChanges.data.dynamic.contacts);
    }

    if (unflattedChanges.data.dynamic.notes) {
      this.actor.editNotes(unflattedChanges.data.dynamic.notes);
    }

    if (unflattedChanges.data.dynamic.psychicDisciplines) {
      this.actor.editPsychicDisciplines(unflattedChanges.data.dynamic.psychicDisciplines);
    }

    if (unflattedChanges.data.dynamic.mentalPatterns) {
      this.actor.editMentalPatterns(unflattedChanges.data.dynamic.mentalPatterns);
    }

    if (unflattedChanges.data.dynamic.innatePsychicPowers) {
      this.actor.editInnatePsychicPowers(
        unflattedChanges.data.dynamic.innatePsychicPowers
      );
    }

    if (unflattedChanges.data.dynamic.psychicPowers) {
      this.actor.editPsychicPowers(unflattedChanges.data.dynamic.psychicPowers);
    }

    if (unflattedChanges.data.dynamic.kiSkills) {
      this.actor.editKiSkills(unflattedChanges.data.dynamic.kiSkills);
    }

    if (unflattedChanges.data.dynamic.nemesisSkills) {
      this.actor.editNemesisSkills(unflattedChanges.data.dynamic.nemesisSkills);
    }

    if (unflattedChanges.data.dynamic.arsMagnus) {
      this.actor.editArsMagnus(unflattedChanges.data.dynamic.arsMagnus);
    }

    if (unflattedChanges.data.dynamic.martialArts) {
      this.actor.editMartialArts(unflattedChanges.data.dynamic.martialArts);
    }

    if (unflattedChanges.data.dynamic.creatures) {
      this.actor.editCreatures(unflattedChanges.data.dynamic.creatures);
    }

    if (unflattedChanges.data.dynamic.specialSkills) {
      this.actor.editSpecialSkills(unflattedChanges.data.dynamic.specialSkills);
    }

    if (unflattedChanges.data.dynamic.techniques) {
      this.actor.editTechniques(unflattedChanges.data.dynamic.techniques);
    }

    if (unflattedChanges.data.dynamic.combatSpecialSkills) {
      this.actor.editCombatSpecialSkills(
        unflattedChanges.data.dynamic.combatSpecialSkills
      );
    }

    if (unflattedChanges.data.dynamic.combatTables) {
      this.actor.editCombatTables(unflattedChanges.data.dynamic.combatTables);
    }

    if (unflattedChanges.data.dynamic.ammo) {
      this.actor.editAmmo(unflattedChanges.data.dynamic.ammo);
    }

    if (unflattedChanges.data.dynamic.weapons) {
      this.actor.editWeapons(unflattedChanges.data.dynamic.weapons);
    }
  }

  private buildCommonContextualMenu = ({
    containerSelector,
    rowSelector,
    rowIdData,
    deleteRowMessage = game.i18n.localize('contextualMenu.common.options.delete'),
    customCallbackFn,
    otherItems = []
  }: {
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

            this.actor.deleteOwnedItem(id);
          }
        }
      },
      ...otherItems
    ]);
  };
}
