/* eslint-disable class-methods-use-this */
import { nanoid } from '../../vendor/nanoid/nanoid';
import { ABFItems } from '../items/ABFItems';
import { ALL_ITEM_CONFIGURATIONS } from './utils/prepareItems/constants';
import { getUpdateObjectFromPath } from './utils/prepareItems/util/getUpdateObjectFromPath';
import { getFieldValueFromPath } from './utils/prepareItems/util/getFieldValueFromPath';
import { prepareActor } from './utils/prepareActor/prepareActor';
import { INITIAL_ACTOR_DATA } from './constants';
import ABFActorSheet from './ABFActorSheet';
import { Log } from '../../utils/Log';
import { migrateItem } from '../items/migrations/migrateItem';
import { executeMacro } from '../utils/functions/executeMacro';
import { ABFSettingsKeys } from '../../utils/registerSettings';
import { calculateDamage } from '../combat/utils/calculateDamage';
import { roundTo5Multiples } from '../combat/utils/roundTo5Multiples';
import { psychicPotentialEffect } from '../combat/utils/psychicPotentialEffect.js';
import { psychicFatigueCheck } from '../combat/utils/psychicFatigueCheck.js';
import { shieldBaseValueCheck } from '../combat/utils/shieldBaseValueCheck.js';
import { shieldValueCheck } from '../combat/utils/shieldValueCheck.js';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll';
import { openModDialog } from '../utils/dialogs/openSimpleInputDialog';

export class ABFActor extends Actor {
  i18n: Localization;

  constructor(
    data: ConstructorParameters<typeof foundry.documents.BaseActor>[0],
    context: ConstructorParameters<typeof foundry.documents.BaseActor>[1]
  ) {
    super(data, context);

    this.i18n = (game as Game).i18n;

    if (this.system.version !== INITIAL_ACTOR_DATA.version) {
      Log.log(
        `Upgrading actor ${this.name} (${this._id}) from version ${this.system.version} to ${INITIAL_ACTOR_DATA.version}`
      );

      this.updateSource({ version: INITIAL_ACTOR_DATA.version });
    }
  }

  async prepareDerivedData() {
    super.prepareDerivedData();

    this.system = foundry.utils.mergeObject(this.system, INITIAL_ACTOR_DATA, {
      overwrite: false
    });

    await prepareActor(this);
  }

  applyFatigue(fatigueUsed: number) {
    const newFatigue =
      this.system.characteristics.secondaries.fatigue.value - fatigueUsed;

    this.update({
      system: {
        characteristics: {
          secondaries: { fatigue: { value: newFatigue } }
        }
      }
    });
  }

  async rollAbility(ability: string, sendToChat = true) {
    const name = game.i18n.localize(`anima.ui.secondaries.${ability}.title`);
    const { secondaries } = this.system;
    let groupPath = '';
    for (const groupKey in secondaries) {
      for (const abilityKey in secondaries[groupKey]) {
        if (abilityKey === ability) {
          groupPath = groupKey;
        }
      }
    }
    if (groupPath === '') {
      return;
    }
    const abilityValue = this.system.secondaries[groupPath][ability].final.value;
    const label = name ? `Rolling ${name}` : '';
    const mod = await openModDialog();
    let formula = `1d100xa + ${abilityValue} + ${mod ?? 0}`;
    if (abilityValue >= 200) formula = formula.replace('xa', 'xamastery');
    const roll = new ABFFoundryRoll(formula, this.system);
    roll.roll();
    if (sendToChat) {
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: label
      });
    }
    return roll.total;
  }

  async newSupernaturalShield(
    type: string,
    power: any,
    psychicDifficulty: number,
    spell: any,
    spellGrade: string
  ) {
    const supernaturalShieldData = {
      name: '',
      type: ABFItems.SUPERNATURAL_SHIELD,
      system: {},
      psychic: { overmantained: false, maintainMax: 0 }
    };
    if (type === 'psychic') {
      const {
        general: {
          settings: { inhuman, zen }
        },
        psychic
      } = this.system;

      const newPotentialBase = psychicPotentialEffect(
        psychic.psychicPotential.base.value,
        0,
        inhuman.value,
        zen.value
      );
      const baseEffect =
        shieldBaseValueCheck(newPotentialBase, power?.system.effects) ?? 0;
      const finalEffect = shieldValueCheck(
        power?.system.effects[psychicDifficulty].value ?? ''
      );
      supernaturalShieldData.name = power.name;
      supernaturalShieldData.system = {
        type: 'psychic',
        damageBarrier: 0,
        shieldPoints: finalEffect,
        origin: this.uuid
      };
      supernaturalShieldData.psychic = {
        overmantained: finalEffect > baseEffect,
        maintainMax: baseEffect
      };
    } else if (type === 'mystic') {
      const finalEffect = shieldValueCheck(
        spell?.system.grades[spellGrade].description.value ?? ''
      );
      supernaturalShieldData.name = spell.name;
      supernaturalShieldData.system = {
        type: 'mystic',
        spellGrade,
        damageBarrier: 0,
        shieldPoints: finalEffect,
        origin: this.uuid
      };
    }

    const item = await this.createItem(supernaturalShieldData);
    let args = {
      thisActor: this,
      newShield: true,
      shieldId: item._id
    };
    if (supernaturalShieldData.psychic.overmantained) {
      item.setFlag('animabf', 'psychic', supernaturalShieldData.psychic);
    }
    executeMacro(supernaturalShieldData.name, args);
    return item._id;
  }

  async deleteSupernaturalShield(supShieldId: any) {
    const { supernaturalShields } = this.system.combat;
    const supShield = supernaturalShields.find(w => w._id === supShieldId);
    if (supShield) {
      this.deleteItem(supShieldId)
      let args = {
        thisActor: this,
        newShield: false,
        shieldId: supShieldId
      };
      executeMacro(supShield.name, args);
    }
  }

  applyDamageSupernaturalShield(
    supShieldId: any,
    damage: number,
    dobleDamage: boolean,
    newCombatResult?: any
  ) {
    const { supernaturalShields } = this.system.combat;
    const supShield = supernaturalShields.find(w => w._id === supShieldId);
    const shieldValue = supShield.system.shieldPoints;
    const newShieldPoints = dobleDamage ? shieldValue - damage * 2 : shieldValue - damage;
    if (newShieldPoints > 0) {
      this.updateItem({
        id: supShieldId,
        system: { shieldPoints: newShieldPoints }
      })
    } else {
      this.deleteSupernaturalShield(supShieldId);
      // If shield breaks, apply damage to actor
      if (newShieldPoints < 0 && newCombatResult) {
        const needToRound = (game as Game).settings.get(
          'animabf',
          ABFSettingsKeys.ROUND_DAMAGE_IN_MULTIPLES_OF_5
        );
        const result = calculateDamage(
          newCombatResult.attack,
          0,
          newCombatResult.at,
          Math.abs(newShieldPoints),
          newCombatResult.halvedAbsorption
        );
        const breakingDamage = needToRound ? roundTo5Multiples(result) : result;
        this.applyDamage(breakingDamage);
      }
    }
  }

  async evaluatePsychicFatigue(power: any, psychicDifficulty: number, sendToChat = true) {
    const fatigueInmune = this.system.general.advantages.find(
      (i: any) => i.name === 'Res. a la fatiga psíquica'
    );
    const fatigue = {
      value: psychicFatigueCheck(power?.system.effects[psychicDifficulty].value),
      inmune: fatigueInmune
    };

    if (fatigue.value) {
      if (sendToChat) {
        const { i18n } = game;
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          flavor: i18n.format('macros.combat.dialog.psychicPotentialFatigue.title', {
            fatiguePen: fatigue.inmune ? 0 : fatigue.value
          })
        });
      }
      if (!fatigue.inmune) {
        this.applyFatigue(fatigue.value);
      }
    }

    return fatigue.value;
  }

  async psychicShieldsMaintenance(revert: boolean) {
    const psychicShields = this.system.combat.supernaturalShields.filter(s => s.system.type === 'psychic');

    for (const psychicShield of psychicShields) {
      const psychic = psychicShield.getFlag('animabf', 'psychic');
      if (psychic?.overmantained) {
        if (psychic.maintainMax >= psychicShield.system.shieldPoints) {
          psychicShield.unsetFlag('animabf', 'psychic');
        } else {
          const supShield = {
            system: psychicShield.system,
            id: psychicShield._id
          };
          const damage = revert ? -5 : 5;
          this.applyDamageSupernaturalShield(supShield, damage, false, undefined);
        }
      }
    }
  }

  accumulateDefenses(keepAccumulating: boolean) {
    const defensesCounter: any = this.getFlag('animabf', 'defensesCounter') || {
      accumulated: 0,
      keepAccumulating
    };
    const newDefensesCounter = defensesCounter.accumulated + 1;
    if (keepAccumulating) {
      this.setFlag('animabf', 'defensesCounter', {
        accumulated: newDefensesCounter,
        keepAccumulating
      });
    } else {
      this.setFlag('animabf', 'defensesCounter.keepAccumulating', keepAccumulating);
    }
  }

  resetDefensesCounter() {
    const defensesCounter = this.getFlag('animabf', 'defensesCounter');
    if (defensesCounter === undefined) {
      this.setFlag('animabf', 'defensesCounter', {
        accumulated: 0,
        keepAccumulating: true
      });
    } else {
      this.setFlag('animabf', 'defensesCounter.accumulated', 0);
    }
  }

  consumeAccumulatedZeon(zeonCost: number) {
    const newAccumulateZeon = this.system.mystic.zeon.accumulated.value - zeonCost;

    this.update({
      system: {
        mystic: {
          zeon: { accumulated: { value: newAccumulateZeon } }
        }
      }
    });
  }

  async consumeMaintainedZeon(revert: boolean) {
    const { zeon, zeonMaintained } = this.system.mystic;
    const updatedZeon = revert
      ? zeon.value + zeonMaintained.value
      : zeon.value - zeonMaintained.value;

    return this.update({
      system: {
        mystic: {
          zeon: { value: updatedZeon }
        }
      }
    });
  }

  deletePreparedSpell(spellName: string, spellGrade: string) {
    let preparedSpellId = this.system.mystic.preparedSpells.find(
      (ps: any) =>
        ps.name == spellName &&
        ps.system.grade.value == spellGrade &&
        ps.system.prepared.value == true
    )._id;
    if (preparedSpellId !== undefined) {
      let items = this.getPreparedSpells();
      items = items.filter(item => item._id !== preparedSpellId);
      const fieldPath = ['mystic', 'preparedSpells'];
      const dataToUpdate = {
        system: getUpdateObjectFromPath(items, fieldPath)
      };
      this.update(dataToUpdate);
    }
  }

  applyDamage(damage: number) {
    const newLifePoints =
      this.system.characteristics.secondaries.lifePoints.value - damage;

    this.update({
      system: {
        characteristics: {
          secondaries: { lifePoints: { value: newLifePoints } }
        }
      }
    });
  }

  public async createItem({
    type,
    name,
    system = {}
  }: {
    type: ABFItems;
    name: string;
    system?: unknown;
  }) {
    const items = await this.createEmbeddedDocuments('Item', [
      {
        type,
        name,
        system
      }
    ]);
    return items[0];
  }

  public async createInnerItem({
    type,
    name,
    system = {}
  }: {
    type: ABFItems;
    name: string;
    system?: unknown;
  }) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    const items =
      getFieldValueFromPath<any[]>(this.system, configuration.fieldPath) ?? [];

    await this.update({
      system: getUpdateObjectFromPath(
        [
          ...items,
          {
            _id: nanoid(),
            type,
            name,
            system
          }
        ],
        configuration.fieldPath
      )
    });
  }

  public async deleteItem(id: string) {
    const item = this.getItem(id);

    if (item) {
      await item.delete();
    }
  }

  public async updateItem({
    id,
    name,
    system = {}
  }: {
    id: string;
    name?: string;
    system?: unknown;
  }) {
    const item = this.getItem(id);

    if (item) {
      let updateObject: Record<string, unknown> = { system };

      if (name) {
        updateObject = {
          ...updateObject,
          name
        };
      }

      if (
        (!!name && name !== item.name) ||
        JSON.stringify(system) !== JSON.stringify(item.system)
      ) {
        await item.update(updateObject);
      }
    }
  }

  public async updateInnerItem(
    {
      type,
      id,
      name,
      system = {}
    }: {
      type: ABFItems;
      id: string;
      name?: string;
      system?: unknown;
    },
    forceSave = false
  ) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    const items = this.getInnerItems(type);
    const item = items.find(it => it._id === id);

    if (item) {
      const hasChanges =
        forceSave ||
        (!!name && name !== item.name) ||
        JSON.stringify(system) !== JSON.stringify(item.system);

      if (hasChanges) {
        if (name) {
          item.name = name;
        }

        if (system) {
          item.system = mergeObject(item.system, system);
        }

        await this.update({
          system: getUpdateObjectFromPath(items, configuration.fieldPath)
        });
      }
    }
  }

  getInnerItem(type: ABFItems, itemId: string) {
    return this.getItemsOf(type).find(item => item._id === itemId);
  }

  public getSecondarySpecialSkills() {
    return this.getItemsOf(ABFItems.SECONDARY_SPECIAL_SKILL);
  }

  public getKnownSpells() {
    return this.getItemsOf(ABFItems.SPELL);
  }

  public getSpellMaintenances() {
    return this.getItemsOf(ABFItems.SPELL_MAINTENANCE);
  }

  public getSelectedSpells() {
    return this.getItemsOf(ABFItems.SELECTED_SPELL);
  }

  public getActVias() {
    return this.getItemsOf(ABFItems.ACT_VIA);
  }

  public getInnateMagicVias() {
    return this.getItemsOf(ABFItems.INNATE_MAGIC_VIA);
  }

  public getPreparedSpells() {
    return this.getItemsOf(ABFItems.PREPARED_SPELL);
  }

  public getSupernaturalShields() {
    return this.getItemsOf(ABFItems.SUPERNATURAL_SHIELD);
  }

  public getKnownMetamagics() {
    return this.getItemsOf(ABFItems.METAMAGIC);
  }

  public getKnownSummonings() {
    return this.getItemsOf(ABFItems.SUMMON);
  }

  public getCategories() {
    return this.getItemsOf(ABFItems.LEVEL);
  }

  public getKnownLanguages() {
    return this.getItemsOf(ABFItems.LANGUAGE);
  }

  public getElans() {
    return this.getItemsOf(ABFItems.ELAN);
  }

  public getElanPowers() {
    return this.getItemsOf(ABFItems.ELAN_POWER);
  }

  public getTitles() {
    return this.getItemsOf(ABFItems.TITLE);
  }

  public getAdvantages() {
    return this.getItemsOf(ABFItems.ADVANTAGE);
  }

  public getDisadvantages() {
    return this.getItemsOf(ABFItems.DISADVANTAGE);
  }

  public getContacts() {
    return this.getItemsOf(ABFItems.CONTACT);
  }

  public getNotes() {
    return this.getItemsOf(ABFItems.NOTE);
  }

  public getPsychicDisciplines() {
    return this.getItemsOf(ABFItems.PSYCHIC_DISCIPLINE);
  }

  public getMentalPatterns() {
    return this.getItemsOf(ABFItems.MENTAL_PATTERN);
  }

  public getInnatePsychicPowers() {
    return this.getItemsOf(ABFItems.INNATE_PSYCHIC_POWER);
  }

  public getPsychicPowers() {
    return this.getItemsOf(ABFItems.PSYCHIC_POWER);
  }

  public getKiSkills() {
    return this.getItemsOf(ABFItems.KI_SKILL);
  }

  public getNemesisSkills() {
    return this.getItemsOf(ABFItems.NEMESIS_SKILL);
  }

  public getArsMagnus() {
    return this.getItemsOf(ABFItems.ARS_MAGNUS);
  }

  public getMartialArts() {
    return this.getItemsOf(ABFItems.MARTIAL_ART);
  }

  public getKnownCreatures() {
    return this.getItemsOf(ABFItems.CREATURE);
  }

  public getSpecialSkills() {
    return this.getItemsOf(ABFItems.SPECIAL_SKILL);
  }

  public getKnownTechniques() {
    return this.getItemsOf(ABFItems.TECHNIQUE);
  }

  public getCombatSpecialSkills() {
    return this.getItemsOf(ABFItems.COMBAT_SPECIAL_SKILL);
  }

  public getCombatTables() {
    return this.getItemsOf(ABFItems.COMBAT_TABLE);
  }

  public getAmmos() {
    return this.getItemsOf(ABFItems.AMMO);
  }

  public getWeapons() {
    return this.getItemsOf(ABFItems.WEAPON);
  }

  public getArmors() {
    return this.getItemsOf(ABFItems.ARMOR);
  }

  public getInventoryItems() {
    return this.getItemsOf(ABFItems.INVENTORY_ITEM);
  }

  public getAllItems() {
    return Object.values(ABFItems).flatMap(itemType => this.getItemsOf(itemType));
  }

  protected _getSheetClass(): ConstructorOf<FormApplication> | null {
    return ABFActorSheet as unknown as ConstructorOf<FormApplication>;
  }

  private getItemsOf(type) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    if (!configuration) {
      console.error(`No configuration found for item type ${type}`);

      return [];
    }

    if (configuration.isInternal) {
      return this.getInnerItems(type);
    }

    return this.items.filter(i => i.type === type);
  }

  private getInnerItems(type) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    if (!configuration) {
      console.error(`No configuration found for item type ${type}`);

      return [];
    }

    if (configuration.fieldPath.length === 0) {
      return [];
    }

    const items = getFieldValueFromPath<any>(this.system, configuration.fieldPath);

    if (Array.isArray(items)) {
      return items.map(migrateItem);
    }

    return [];
  }

  private getItem(itemId: string) {
    return this.getEmbeddedDocument('Item', itemId);
  }
}
