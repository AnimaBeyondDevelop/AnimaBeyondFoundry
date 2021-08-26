/* eslint-disable class-methods-use-this */
import { openDialog } from '../utils/openDialog';
import { SecondarySpecialSkillChanges } from '../types/SecondarySpecialSkillChanges';
import { FreeAccessSpellChange } from '../types/FreeAccessSpellChange';
import { SelectedSpellsChange } from '../types/SelectedSpellsChange';
import { MetamagicChanges } from '../types/MetamagicChange';
import { SummonChanges } from '../types/SummonChange';
import { SpellMaintenancesChanges } from '../types/SpellMaintenancesChange';
import { LevelChanges } from '../types/LevelChange';
import { LanguageChanges } from '../types/LanguageChange';
import { ElanPowerChanges } from '../types/ElanPowerChanges';
import { ElanChanges } from '../types/ElanChanges';
import { nanoid } from '../../vendor/nanoid/nanoid';
import { TitleChanges } from '../types/TitleChange';
import { AdvantageChange } from '../types/AdvantageChange';
import { ContactChange } from '../types/ContactChange';
import { DisadvantageChange } from '../types/DisadvantageChange';
import { NoteChange } from '../types/NoteChange';
import { PsychicDisciplineChanges } from '../types/PsychicDisciplineChanges';
import { MentalPatternChanges } from '../types/MentalPatternChanges';
import { InnatePsychicPowerChanges } from '../types/InnatePsychicPowerChanges';
import { PsychicPowerChanges } from '../types/PsychicPowerChanges';
import { KiSkillsChanges } from '../types/KiSkillsChanges';
import { NemesisSkillsChanges } from '../types/NemesisSkillsChanges';
import { ArsMagnusChanges } from '../types/ArsMagnusChanges';
import { MartialArtsChanges } from '../types/MartialArtsChanges';
import { CreaturesChanges } from '../types/CreaturesChanges';
import { TechniquesChanges } from '../types/TechniquesChanges';
import { SpecialSkillsChanges } from '../types/SpecialSkillsChanges';
import { CombatSpecialSkillChanges } from '../types/CombatSpecialSkillChanges';
import { CombatTableChanges } from '../types/CombatTableChanges';
import { AmmoChanges } from '../types/AmmoChanges';
import { WeaponChanges } from '../types/WeaponChanges';
import { prepareActor } from './utils/prepareActor/prepareActor';
import { ABFItems } from './utils/prepareSheet/prepareItems/ABFItems';
import { ATTACH_CONFIGURATIONS } from './utils/prepareSheet/prepareItems/constants';
import { getUpdateObjectFromPath } from './utils/prepareSheet/prepareItems/util/getUpdateObjectFromPath';
import { getFieldValueFromPath } from './utils/prepareSheet/prepareItems/util/getFieldValueFromPath';

export class ABFActor extends Actor {
  i18n: Localization;

  constructor(
    data: ConstructorParameters<typeof foundry.documents.BaseActor>[0],
    context: ConstructorParameters<typeof foundry.documents.BaseActor>[1]
  ) {
    super(data, context);

    this.i18n = (game as Game).i18n;
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    prepareActor(this.data);
  }

  public async addSummon(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.summon.content')
    });

    await this.createItem({ type: ABFItems.SUMMON, name });
  }

  public async editSummon(invocation: SummonChanges) {
    for (const id of Object.keys(invocation)) {
      const { name } = invocation[id];

      await this.updateItem({ id, name });
    }
  }

  public async addSelectedSpell(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.selectedSpell.content')
    });

    await this.createInnerItem({
      name,
      type: ABFItems.SELECTED_SPELL,
      data: { cost: { value: 0 } }
    });
  }

  public async editSelectedSpell(changes: SelectedSpellsChange) {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await this.updateInnerItem({ id, type: ABFItems.SELECTED_SPELL, name, data });
    }
  }

  public async addSpellMaintenance(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.spellMaintenance.content')
    });

    await this.createInnerItem({
      name,
      type: ABFItems.SPELL_MAINTENANCE,
      data: { cost: { value: 0 } }
    });
  }

  public async editSpellMaintenance(changes: SpellMaintenancesChanges) {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await this.updateInnerItem({ id, type: ABFItems.SPELL_MAINTENANCE, name, data });
    }
  }

  public async addFreeAccessSpell(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.freeAccessSpell.content')
    });

    await this.createItem({
      name,
      type: ABFItems.FREE_ACCESS_SPELL,
      data: { level: { value: 0 }, cost: { value: 0 } }
    });
  }

  public async editFreeAccessSpells(changes: FreeAccessSpellChange) {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await this.updateItem({ id, name, data });
    }
  }

  async addSecondarySpecialSkill(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.secondarySkill.content')
    });

    this.createInnerItem({
      name,
      type: ABFItems.SECONDARY_SPECIAL_SKILL,
      data: { level: { value: 0 } }
    });
  }

  public editSecondarySpecialSkills(skillChanges: SecondarySpecialSkillChanges) {
    for (const id of Object.keys(skillChanges)) {
      const { data } = skillChanges[id];

      this.updateInnerItem({ id, type: ABFItems.SECONDARY_SPECIAL_SKILL, data });
    }
  }

  public async addMetamagic(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.metamagic.content')
    });

    await this.createItem({
      name,
      type: ABFItems.METAMAGIC,
      data: { grade: { value: 0 } }
    });
  }

  public async editMetamagic(changes: MetamagicChanges) {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await this.updateItem({ id, name, data });
    }
  }

  public async addLevel(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.level.content')
    });

    this.createInnerItem({ type: ABFItems.LEVEL, name, data: { level: 0 } });
  }

  public editLevel(changes: LevelChanges) {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      this.updateInnerItem({ type: ABFItems.LEVEL, id, name, data });
    }
  }

  public async addLanguage(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.language.content')
    });

    this.createEmbeddedDocuments('Item', [{ type: ABFItems.LANGUAGE, name }]);
  }

  public async editLanguage(changes: LanguageChanges) {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      const item = this.getEmbeddedDocument('Item', id);

      if (item) {
        await item.update({ name });
      }
    }
  }

  public async addElanPower(elanId: string): Promise<void> {
    if (!elanId) throw new Error('elanId missing');

    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.elan_power.content')
    });

    const power = { _id: nanoid(), name, level: 0 };

    const elan = this.getInnerItem(ABFItems.ELAN, elanId);

    if (elan) {
      const { data } = elan;

      const powers: any[] = [];

      if (!data.powers) {
        powers.push(power);
      } else {
        powers.push(...[...data.powers, power]);
      }

      await this.updateInnerItem({
        type: ABFItems.ELAN,
        id: elanId,
        data: { ...elan.data, powers }
      });
    }
  }

  public async editElanPower(elanPowers: ElanPowerChanges) {
    for (const id of Object.keys(elanPowers)) {
      const { name, elanId, level } = elanPowers[id];

      if (!elanId) throw new Error('elanId missing');

      const elan = this.getInnerItem(ABFItems.ELAN, elanId);

      if (elan) {
        const elanPower = elan.data.powers.find(power => power._id === id);

        if (elanPower.name === name && elanPower.level === level) continue;

        elanPower.name = name;
        elanPower.level = level;

        this.updateInnerItem({
          type: ABFItems.ELAN,
          id,
          data: { ...elan.data, powers: [...elan.data.powers] }
        });
      }
    }
  }

  public async removeElanPower(elanId: string, elanPowerId: string): Promise<void> {
    if (!elanId) throw new Error('elanId missing');
    if (!elanPowerId) throw new Error('elanPowerId missing');

    const elan = this.getInnerItem(ABFItems.ELAN, elanId);

    if (elan) {
      this.updateInnerItem({
        type: ABFItems.ELAN,
        id: elanId,
        data: {
          ...elan.data,
          powers: elan.data.powers.filter(power => power._id !== elanPowerId)
        }
      });
    }
  }

  public async addElan(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.elan.content')
    });

    this.createInnerItem({
      name,
      type: ABFItems.ELAN,
      data: {
        level: 0,
        powers: []
      }
    });
  }

  public editElan(changes: ElanChanges) {
    for (const id of Object.keys(changes)) {
      const { name, level } = changes[id];

      const elan = this.getInnerItem(ABFItems.ELAN, id);

      this.updateInnerItem({
        type: ABFItems.ELAN,
        id,
        name,
        data: { ...elan.data, level }
      });
    }
  }

  public async addTitle(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.title.content')
    });

    await this.createInnerItem({
      name,
      type: ABFItems.TITLE
    });
  }

  public async editTitles(titles: TitleChanges) {
    for (const id of Object.keys(titles)) {
      const { name } = titles[id];

      await this.updateInnerItem({ id, type: ABFItems.TITLE, name });
    }
  }

  public async addAdvantage(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.advantage.content')
    });

    await this.createItem({
      name,
      type: ABFItems.ADVANTAGE
    });
  }

  public async editAdvantages(advantages: AdvantageChange) {
    for (const id of Object.keys(advantages)) {
      const { name } = advantages[id];

      await this.updateItem({ id, name });
    }
  }

  public async addDisadvantage(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.disadvantage.content')
    });

    await this.createItem({
      name,
      type: ABFItems.DISADVANTAGE
    });
  }

  public async editDisadvantages(disadvantages: DisadvantageChange) {
    for (const id of Object.keys(disadvantages)) {
      const { name } = disadvantages[id];

      await this.updateItem({ id, name });
    }
  }

  public async addContact(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.contact.content')
    });

    await this.createInnerItem({
      name,
      type: ABFItems.CONTACT
    });
  }

  public async editContacts(contacts: ContactChange) {
    for (const id of Object.keys(contacts)) {
      const { name, description } = contacts[id];

      await this.updateInnerItem({
        id,
        type: ABFItems.CONTACT,
        name,
        data: { description: { value: description } }
      });
    }
  }

  public async addNote(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.note.content')
    });

    await this.createItem({
      name,
      type: ABFItems.NOTE
    });
  }

  public async editNotes(notes: NoteChange) {
    for (const id of Object.keys(notes)) {
      const { name } = notes[id];

      await this.updateItem({ id, name });
    }
  }

  public async addPsychicDiscipline(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.psychicDiscipline.content')
    });

    await this.createItem({
      name,
      type: ABFItems.PSYCHIC_DISCIPLINE
    });
  }

  public async editPsychicDisciplines(changes: PsychicDisciplineChanges) {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await this.updateItem({ id, name });
    }
  }

  public async addMentalPattern(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.mentalPattern.content')
    });

    await this.createItem({
      name,
      type: ABFItems.MENTAL_PATTERN,
      data: {
        bonus: 0,
        penalty: 0
      }
    });
  }

  public async editMentalPatterns(changes: MentalPatternChanges) {
    for (const id of Object.keys(changes)) {
      const { name, bonus, penalty } = changes[id];

      await this.updateItem({
        id,
        name,
        data: { bonus: { value: bonus }, penalty: { value: penalty } }
      });
    }
  }

  public async addInnatePsychicPower(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.innatePsychicPower.content')
    });

    await this.createItem({
      name,
      type: ABFItems.INNATE_PSYCHIC_POWER,
      data: {
        effect: '',
        value: 0
      }
    });
  }

  public async editInnatePsychicPowers(changes: InnatePsychicPowerChanges) {
    for (const id of Object.keys(changes)) {
      const { name, effect, value } = changes[id];

      await this.updateItem({
        id,
        name,
        data: {
          effect: { value: effect },
          value: { value }
        }
      });
    }
  }

  public async addPsychicPower(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.psychicPower.content')
    });

    await this.createItem({
      name,
      type: ABFItems.PSYCHIC_POWER,
      data: {
        level: { value: 0 },
        effects: new Array(10).fill({ value: '' }),
        actionType: { value: '' },
        hasMaintenance: { value: false },
        bonus: { value: 0 }
      }
    });
  }

  public async editPsychicPowers(changes: PsychicPowerChanges) {
    for (const id of Object.keys(changes)) {
      const {
        name,
        bonus,
        actionType,
        effects: effectsObject,
        hasMaintenance,
        level
      } = changes[id];

      const effects = [];

      for (const key of Object.keys(effectsObject)) {
        effects[key] = { value: effectsObject[key] };
      }

      await this.updateItem({
        id,
        name,
        data: {
          bonus: { value: bonus },
          actionType: { value: actionType },
          effects,
          hasMaintenance: { value: hasMaintenance },
          level: { value: level }
        }
      });
    }
  }

  public async addKiSkill(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.kiSkill.content')
    });

    await this.createItem({
      name,
      type: ABFItems.KI_SKILL
    });
  }

  public async editKiSkills(changes: KiSkillsChanges) {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await this.updateItem({ id, name });
    }
  }

  public async addNemesisSkill(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.nemesisSkill.content')
    });

    await this.createItem({
      name,
      type: ABFItems.NEMESIS_SKILL
    });
  }

  public async editNemesisSkills(changes: NemesisSkillsChanges) {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await this.updateItem({ id, name });
    }
  }

  public async addArsMagnus(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.arsMagnus.content')
    });

    await this.createItem({
      name,
      type: ABFItems.ARS_MAGNUS
    });
  }

  public async editArsMagnus(changes: ArsMagnusChanges) {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await this.updateItem({ id, name });
    }
  }

  public async addMartialArt(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.martialArt.content')
    });

    await this.createItem({
      name,
      type: ABFItems.MARTIAL_ART,
      data: {
        grade: { value: '' }
      }
    });
  }

  public async editMartialArts(changes: MartialArtsChanges) {
    for (const id of Object.keys(changes)) {
      const { name, grade } = changes[id];

      await this.updateItem({ id, name, data: { grade: { value: grade } } });
    }
  }

  public async addCreature(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.creature.content')
    });

    await this.createInnerItem({
      name,
      type: ABFItems.CREATURE,
      data: {
        earth: {
          value: false
        },
        fire: {
          value: false
        },
        metal: {
          value: false
        },
        water: {
          value: false
        },
        wood: {
          value: false
        }
      }
    });
  }

  public async editCreatures(changes: CreaturesChanges) {
    for (const id of Object.keys(changes)) {
      const { name, earth, fire, metal, water, wood } = changes[id];

      await this.updateInnerItem({
        id,
        type: ABFItems.CREATURE,
        name,
        data: {
          earth: { value: earth },
          fire: { value: fire },
          metal: { value: metal },
          water: { value: water },
          wood: { value: wood }
        }
      });
    }
  }

  public async addSpecialSkill(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.specialSkill.content')
    });

    await this.createInnerItem({
      name,
      type: ABFItems.SPECIAL_SKILL
    });
  }

  public async editSpecialSkills(changes: SpecialSkillsChanges) {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await this.updateInnerItem({ id, type: ABFItems.SPECIAL_SKILL, name });
    }
  }

  public async addTechnique(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.technique.content')
    });

    await this.createItem({
      name,
      type: ABFItems.TECHNIQUE,
      data: {
        description: { value: '' },
        level: { value: 0 },
        strength: { value: 0 },
        agility: { value: 0 },
        dexterity: { value: 0 },
        constitution: { value: 0 },
        willPower: { value: 0 },
        power: { value: 0 },
        martialKnowledge: { value: 0 }
      }
    });
  }

  public async editTechniques(changes: TechniquesChanges) {
    for (const id of Object.keys(changes)) {
      const {
        name,
        level,
        constitution,
        power,
        willPower,
        agility,
        dexterity,
        description,
        martialKnowledge,
        strength
      } = changes[id];

      await this.updateItem({
        id,
        name,
        data: {
          level: { value: level },
          constitution: { value: constitution },
          power: { value: power },
          willPower: { value: willPower },
          agility: { value: agility },
          dexterity: { value: dexterity },
          description: { value: description },
          martialKnowledge: { value: martialKnowledge },
          strength: { value: strength }
        }
      });
    }
  }

  public async addCombatSpecialSkill(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.combatSpecialSkills.content')
    });

    await this.createInnerItem({
      name,
      type: ABFItems.COMBAT_SPECIAL_SKILL
    });
  }

  public editCombatSpecialSkills(changes: CombatSpecialSkillChanges) {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      this.updateInnerItem({
        id,
        type: ABFItems.COMBAT_SPECIAL_SKILL,
        name
      });
    }
  }

  public async addCombatTable(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.combatTable.content')
    });

    await this.createItem({
      name,
      type: ABFItems.COMBAT_TABLE
    });
  }

  public editCombatTables(changes: CombatTableChanges) {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      this.updateItem({
        id,
        name
      });
    }
  }

  public async addAmmo(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.ammo.content')
    });

    await this.createInnerItem({
      name,
      type: ABFItems.AMMO,
      data: {
        amount: { value: 0 }
      }
    });
  }

  public editAmmo(changes: AmmoChanges) {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      this.updateInnerItem({
        id,
        type: ABFItems.AMMO,
        name,
        data: {
          amount: { value: data.amount }
        }
      });
    }
  }

  public async addWeapon(): Promise<void> {
    const name = await openDialog<string>({
      content: this.i18n.localize('dialogs.items.weapons.content')
    });

    const itemData = {
      name,
      type: ABFItems.WEAPON,
      data: {
        special: { value: 0 },
        integrity: { value: 0 },
        breaking: { value: 0 },
        attack: { value: 0 },
        block: { value: 0 },
        damage: { value: 0 },
        initiative: { value: 0 },
        critic: {
          primary: { value: '' },
          secondary: { value: '' }
        }
      }
    };

    await this.createItem(itemData);
  }

  public editWeapons(changes: WeaponChanges) {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      this.updateItem({
        id,
        name,
        data: {
          special: { value: data.special },
          integrity: { value: data.integrity },
          breaking: { value: data.breaking },
          attack: { value: data.attack },
          block: { value: data.block },
          damage: { value: data.damage },
          initiative: { value: data.initiative },
          critic: {
            primary: { value: data.critic.primary },
            secondary: { value: data.critic.secondary }
          }
        }
      });
    }
  }

  private async createItem({
    type,
    name,
    data = {}
  }: {
    type: ABFItems;
    name: string;
    data?: unknown;
  }) {
    await this.createEmbeddedDocuments('Item', [{ type, name, data }]);
  }

  private async createInnerItem({
    type,
    name,
    data = {}
  }: {
    type: ABFItems;
    name: string;
    data?: unknown;
  }) {
    const configuration = ATTACH_CONFIGURATIONS[type];

    const items =
      getFieldValueFromPath<any[]>(this.data.data, configuration.fieldPath) ?? [];

    await this.update({
      data: getUpdateObjectFromPath(
        [...items, { _id: nanoid(), type, name, data }],
        configuration.fieldPath
      )
    });
  }

  private async updateItem({
    id,
    name,
    data = {}
  }: {
    id: string;
    name?: string;
    data?: unknown;
  }) {
    const item = this.getItem(id);

    if (item) {
      let updateObject: Record<string, unknown> = { data };

      if (name) {
        updateObject = { ...updateObject, name };
      }

      if (
        (!!name && name !== item.name) ||
        JSON.stringify(data) !== JSON.stringify(item.data.data)
      ) {
        await item.update(updateObject);
      }
    }
  }

  private async updateInnerItem({
    type,
    id,
    name,
    data = {}
  }: {
    type: ABFItems;
    id: string;
    name?: string;
    data?: unknown;
  }) {
    const configuration = ATTACH_CONFIGURATIONS[type];

    const items = getFieldValueFromPath<any[]>(this.data.data, configuration.fieldPath);

    const item = items.find(it => it._id === id);

    if (item) {
      const hasChanges =
        (!!name && name !== item.name) ||
        JSON.stringify(data) !== JSON.stringify(item.data);

      if (hasChanges) {
        if (name) {
          item.name = name;
        }

        if (data) {
          item.data = data;
        }

        await this.update({
          data: getUpdateObjectFromPath(items, configuration.fieldPath)
        });
      }
    }
  }

  private getItem(itemId: string) {
    return this.getEmbeddedDocument('Item', itemId);
  }

  private getInnerItem(type: ABFItems, itemId: string) {
    const configuration = ATTACH_CONFIGURATIONS[type];

    return getFieldValueFromPath<any>(this.data.data, configuration.fieldPath).find(
      item => item._id === itemId
    );
  }
}
