/* eslint-disable class-methods-use-this */
import { nanoid } from '../../vendor/nanoid/nanoid';
import { ABFItems } from '../items/ABFItems';
import { ALL_ITEM_CONFIGURATIONS } from './utils/prepareItems/constants';
import { getUpdateObjectFromPath } from './utils/prepareItems/util/getUpdateObjectFromPath';
import { getFieldValueFromPath } from './utils/prepareItems/util/getFieldValueFromPath';
import { prepareActor } from './utils/prepareActor/prepareActor';
import { INITIAL_ACTOR_DATA } from './constants';
import ABFActorSheet from './ABFActorSheet';
import { Logger } from '../../utils';
import { migrateItem } from '../items/migrations/migrateItem';
import { executeMacro } from '../utils/functions/executeMacro';
import { ABFSettingsKeys } from '../../utils/registerSettings';
import { calculateDamage } from '../combat/utils/calculateDamage';
import { floorTo5Multiple } from '@utils/rounding';
import { psychicPotentialEffect } from '../combat/utils/psychicPotentialEffect.js';
import { psychicFatigueCheck } from '../combat/utils/psychicFatigueCheck.js';
import { shieldBaseValueCheck } from '../combat/utils/shieldBaseValueCheck.js';
import { shieldValueCheck } from '../combat/utils/shieldValueCheck.js';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll';
import { openModDialog } from '../utils/dialogs/openSimpleInputDialog';
import { CombatResults } from '../combat/results/CombatResults.svelte.js';
import { CombatResultsCalculator } from '../combat/results/CombatResultsCalculator.svelte.js';
import ABFItem from '../items/ABFItem';

export class ABFActor extends Actor {
  i18n = game.i18n;

  /**
   * @param {ConstructorParameters<typeof foundry.documents.BaseActor>[0]} data
   * @param {ConstructorParameters<typeof foundry.documents.BaseActor>[1]} context
   */
  constructor(data, context) {
    super(data, context);

    if (this.system.version !== INITIAL_ACTOR_DATA.version) {
      Logger.log(
        `Upgrading actor ${this.name} (${this._id}) from version ${this.system.version} to ${INITIAL_ACTOR_DATA.version}`
      );

      this.updateSource({ 'system.version': INITIAL_ACTOR_DATA.version });
    }
  }

  async prepareDerivedData() {
    super.prepareDerivedData();

    this.system = foundry.utils.mergeObject(this.system, INITIAL_ACTOR_DATA, {
      overwrite: false
    });

    await prepareActor(this);
  }

  /**
   * Updates the value of the 'fatigue' secondary characteristic of an ABFActor object.
   *
   * @param {number} fatigueUsed - The amount of fatigue to be subtracted from the current value.
   * @returns {void}
   */
  applyFatigue(fatigueUsed) {
    if (!fatigueUsed) return;
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

  applyPsychicFatigue(psychicFatigue) {
    if (!psychicFatigue) return;
    const cvs = this.system.psychic.psychicPoints.value;

    this.consumePsychicPoints(psychicFatigue);
    if (cvs < psychicFatigue) {
      this.applyFatigue(psychicFatigue - cvs);
    }
  }

  consumePsychicPoints(psychicPoints) {
    if (!psychicPoints) return;
    const cvs = this.system.psychic.psychicPoints.value;

    this.update({
      system: {
        psychic: {
          psychicPoints: {
            value: Math.max(cvs - psychicPoints, 0)
          }
        }
      }
    });
  }

  /**
   * Rolls an ability check for the ABFActor class.
   *
   * @param {string} ability - The name of the ability to roll.
   * @param {boolean} sendToChat - Whether to send the roll result to the chat. Default is true.
   * @returns {Promise<number>} - The total result of the dice roll.
   *
   * @example
   * const actor = new ABFActor(data, context);
   * await actor.rollAbility('agility', true);
   *
   * This code creates a new instance of the ABFActor class and calls the `rollAbility` method with the ability name 'agility' and the `sendToChat` parameter set to true. The method will calculate the ability value, prompt the user for a modifier, roll the dice, and display the result in the chat.
   */
  async rollAbility(ability, sendToChat = true) {
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
    await roll.roll();
    if (sendToChat) {
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: label
      });
    }
    return roll.total;
  }

  /**
   * Creates a new supernatural shield item for the ABFActor class and execute a macro using the shield's name.
   *
   * @param {string} type The type of the supernatural shield ('psychic' or 'mystic').
   * @param {any} power - The power object containing information about the psychic power. Only needed if type = 'psychic'.
   * @param {number} psychicDifficulty - The difficulty level of the psychic power. Only needed if type = 'psychic'.
   * @param {any} spell - The spell object containing information about the mystic spell. Only needed if type = 'mystic'.
   * @param {string} spellGrade - The grade of the mystic spell. Only needed if type = 'mystic'.
   * @returns {Promise<string>} - The ID of the newly created supernatural shield item.
   */
  async newSupernaturalShield(type, power, psychicDifficulty, spell, spellGrade) {
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

      const potentialBaseDifficulty = psychicPotentialEffect(
        psychic.psychicPotential.base.value,
        0,
        inhuman.value,
        zen.value
      );
      const baseEffect =
        shieldBaseValueCheck(potentialBaseDifficulty, power?.system.effects) ?? 0;
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

  /**
   * Deletes a supernatural shield item from the actor's inventory and exucute a macro passing argument 'newShield: false, shieldId: supShieldId' to stop the corresponding the animation.
   *
   * @param {string} supShieldId  The ID of the supernatural shield item to be deleted.
   * @returns {void}
   */
  async deleteSupernaturalShield(supShieldId) {
    const supShield = this.getItem(supShieldId);
    if (supShield) {
      await this.deleteItem(supShieldId);
      let items = this.getSupernaturalShields();
      items = items.filter(item => item._id !== supShieldId);
      const fieldPath = ['combat', 'supernaturalShields'];
      await this.update({ system: getUpdateObjectFromPath(items, fieldPath) });
      let args = {
        thisActor: this,
        newShield: false,
        shieldId: supShieldId
      };
      executeMacro(supShield.name ?? undefined, args);
    }
  }

  /**
   * Applies damage to a supernatural shield.
   * If the damage reduces the shield's points to zero or below, the shield is deleted and the remaining damage is recalculated and applied to the actor.
   *
   * @param {string} supShieldId - The ID of the supernatural shield to apply damage to.
   * @param {number} damage - The amount of damage to apply to the shield.
   * @param {boolean} [dobleDamage] - Whether to apply double damage or not. Default is `false`.
   * @param {CombatResults} [currentCombatResult] - Additional combat result data used to calculate damage to the actor if the shield breaks.
   *
   * @returns {void}
   */
  async applyDamageSupernaturalShield(supShieldId, damage, currentCombatResult) {
    if (!damage) return;
    const supShield = this.getItem(supShieldId);
    const newShieldPoints = supShield?.system.shieldPoints - damage;
    if (newShieldPoints > 0) {
      this.updateItem({
        id: supShieldId,
        system: { shieldPoints: newShieldPoints }
      });
    } else {
      this.deleteSupernaturalShield(supShieldId);
      // If shield breaks, apply damage to actor
      if (newShieldPoints < 0 && currentCombatResult) {
        const { attack, defense } = currentCombatResult;
        let newCombatResult = new CombatResultsCalculator(
          {
            finalAbility: attack.finalAbility,
            finalDamage: Math.abs(newShieldPoints),
            halvedAbsorption: attack.halvedAbsorption
          },
          {
            finalAbility: 0,
            finalAt: defense.finalAt,
            halvedAbsorption: defense.halvedAbsorption
          }
        );
        this.applyDamage(newCombatResult.damage);
      }
    }
  }

  /**
   * Evaluates the psychic fatigue caused by using a power in the game.
   * It checks if the actor has immunity to fatigue and calculates the fatigue value based on the power's effects and the psychic difficulty.
   * If the actor is not immune to fatigue, it applies the fatigue value to the actor's characteristics.
   *
   * @param {object} power - The power for which the psychic fatigue is being evaluated.
   * @param {number} psychicDifficulty - The difficulty level of the psychic power.
   * @param {boolean} eliminateFatigue - Whether to apply the fatigue value or not to the actor's characteristics.
   * @param {boolean} sendToChat - Whether to send a chat message or not. Default is `true`.
   * @param {boolean} applyPsychicFatigue - Whether to apply the PsychicFatigue or spent psychic Points. Default is `true`.
   *
   * @returns {{ value: number, inmune: boolean }} An object containing:
   *   - `value` (number): The computed psychic fatigue value.
   *   - `inmune` (boolean): Whether the entity is immune to psychic fatigue.
   */
  evaluatePsychicFatigue(
    power,
    psychicDifficulty,
    eliminateFatigue,
    sendToChat = true,
    applyPsychicFatigue = true
  ) {
    const {
      psychic: {
        psychicSettings: { fatigueResistance },
        psychicPoints
      }
    } = this.system;
    const psychicFatigue = {
      value: psychicFatigueCheck(power?.system.effects[psychicDifficulty].value),
      inmune: fatigueResistance || eliminateFatigue
    };

    if (psychicFatigue.value) {
      if (sendToChat) {
        const { i18n } = game;
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          flavor: i18n.format('macros.combat.dialog.psychicPotentialFatigue.title', {
            fatiguePen: psychicFatigue.inmune ? 0 : psychicFatigue.value
          })
        });
      }
      if (!psychicFatigue.inmune && applyPsychicFatigue) {
        this.applyPsychicFatigue(psychicFatigue.value);
      }
    }
    if (eliminateFatigue && applyPsychicFatigue) {
      this.consumePsychicPoints(1);
    }

    return psychicFatigue;
  }

  /**
   * Performs maintenance on psychic shields by checking if they are overmaintained or need to be damaged.
   * If a psychic shield is overmaintained, it is either unset or damaged based on the `revert` parameter.
   * Its executed in every next turn in ABFCombat, if the combat goes to a previous turn the 'revert' parameter is set to true.
   *
   * @param {boolean} revert - A flag indicating whether to revert the maintenance or not.
   */
  async psychicShieldsMaintenance(revert) {
    const psychicShields = this.system.combat.supernaturalShields.filter(
      s => s.system.type === 'psychic'
    );

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
          this.applyDamageSupernaturalShield(supShield.id, damage, false, undefined);
        }
      }
    }
  }

  /** @type {boolean} */
  get autoAccumulateDefenses() {
    return /** @type {boolean} */ (this.getFlag('animabf', 'accumulateDefenses')) ?? true;
  }
  set autoAccumulateDefenses(value) {
    this.setFlag('animabf', 'accumulateDefenses', value);
  }

  /** @type {number} */
  get accumulatedDefenses() {
    return this.getFlag('animabf', 'defensesCounter') ?? 0;
  }
  set accumulatedDefenses(value) {
    if (!this.autoAccumulateDefenses) return;
    this.setFlag('animabf', 'defensesCounter', value);
  }

  /**
   * Resets the accumulated defenses counter for an ABFActor object.
   *
   * @example
   * const actor = new ABFActor(data, context);
   * actor.resetDefensesCounter();
   */
  resetDefensesCounter() {
    this.accumulatedDefenses = 0;
  }

  /**
   * Evaluates if this actor can cast a spell at a given spellgrade with certain casting method.
   * This method is responsible for issuing notifications informing the user whenever casting
   * is not possible.
   *
   * @param {ABFItem} spell
   * @param {"base"|"intermediate"|"advanced"|"arcane"} spellGrade
   * @param {"override"|"accumulated"|"innate"|"prepared"} castMethod
   * @param {Object} [increasedZeon] The increased zeon cost for the spell.
   * @param {number} [increasedZeon.accumulated=0] - The part of the increased zeon cost that needs
   * to be accumulated. Defaults to 0
   * @param {number} [increasedZeon.pool=0] - The part of the increased zeon cost that is automatically
   * deduced from the character's zeon pool, without accumulating. Used for instance in metamagic.
   * Defaults to 0.
   * @returns {boolean} A boolean value indicating whether the spell can be cast or not.
   */
  canCastSpell(
    spell,
    spellGrade,
    castMethod,
    increasedZeon = { accumulated: 0, pool: 0 }
  ) {
    let canCast = false;
    let warningMessage = '';
    let zeonCost =
      spell?.system.grades[spellGrade].zeon.value + (increasedZeon.accumulated ?? 0);
    let zeonPool = this.system.mystic.zeon.value;

    switch (castMethod) {
      case 'accumulated': {
        let zeonAccumulated = this.system.mystic.zeon.accumulated;
        canCast = zeonAccumulated >= zeonCost;
        warningMessage = 'dialogs.spellCasting.warning.zeonAccumulated';
        break;
      }
      case 'innate': {
        let spellVia = spell?.system.via.value;
        let innateMagic = this.system.mystic.innateMagic;
        let innateVia = innateMagic.via.find(i => i.name == spellVia);
        let innateMagicValue =
          innateMagic.via.length !== 0 && innateVia
            ? innateVia.system.final.value
            : innateMagic.main.final.value;
        canCast = innateMagicValue >= zeonCost;
        warningMessage = 'dialogs.spellCasting.warning.innateMagic';
        break;
      }
      case 'prepared': {
        canCast =
          this.getPreparedSpells().find(
            ps => ps.name == spell.name && ps.system.grade.value == spellGrade
          )?.system.prepared.value ?? false;
        warningMessage = 'dialogs.spellCasting.warning.preparedSpell';
        break;
      }
      case 'override': {
        return true;
      }
    }
    if (zeonPool < (increasedZeon.pool ?? 0)) {
      canCast = false;
      warningMessage = 'dialogs.spellCasting.warning.zeonPool';
    }
    if (!canCast) {
      ui.notifications.warn(game.i18n.localize(warningMessage));
    }
    return canCast;
  }

  canCast(spell, spellGrade, castMethod, increasedCost = { zeon: 0, pool: 0 }) {
    let canCast = false;
    let warningMessage = '';
    let zeonCost = spell?.system.grades[spellGrade].zeon.value + increasedCost.zeon;
    let zeonPool = this.system.mystic.zeon.value;

    switch (castMethod) {
      case 'accumulated': {
        let zeonAccumulated = this.system.mystic.zeon.accumulated;
        canCast = zeonAccumulated >= zeonCost;
        warningMessage = 'dialogs.spellCasting.warning.zeonAccumulated';
        break;
      }
      case 'innate': {
        let spellVia = spell?.system.via.value;
        let innateMagic = this.system.mystic.innateMagic;
        let innateVia = innateMagic.via.find(i => i.name == spellVia);
        let innateMagicValue =
          innateMagic.via.length !== 0 && innateVia
            ? innateVia.system.final.value
            : innateMagic.main.final.value;
        canCast = innateMagicValue >= zeonCost;
        warningMessage = 'dialogs.spellCasting.warning.innateMagic';
        break;
      }
      case 'prepared': {
        canCast =
          this.getPreparedSpells().find(
            ps => ps.name == spell.name && ps.system.grade.value == spellGrade
          )?.system.prepared.value ?? false;
        warningMessage = 'dialogs.spellCasting.warning.preparedSpell';
        break;
      }
      case 'override': {
        return true;
      }
    }
    if (zeonPool < increasedCost.pool) {
      canCast = false;
      warningMessage = 'dialogs.spellCasting.warning.zeonPool';
    }
    if (!canCast) {
      ui.notifications.warn(game.i18n.localize(warningMessage));
    }
    return canCast;
  }

  /**
   * Handles the casting of mystic spells by an actor in the ABFActor class.
   * Calls this.canCastSpell() to check if the spell can be cast, this.consumeAccumulatedZeon()
   * to update the accumulated zeon value and this.deletePreparedSpell() to update prepared spells.
   *
   * @param {ABFItem} spell
   * @param {"base"|"intermediate"|"advanced"|"arcane"} spellGrade
   * @param {"override"|"accumulated"|"innate"|"prepared"} castMethod
   * @param {Object} [increasedZeon] The increased zeon cost for the spell.
   * @param {number} [increasedZeon.accumulated=0] - The part of the increased zeon cost that needs
   * to be accumulated. Defaults to 0
   * @param {number} [increasedZeon.pool=0] - The part of the increased zeon cost that is automatically
   * deduced from the character's zeon pool, without accumulating. Used for instance in metamagic.
   * Defaults to 0.
   */
  castSpell(spell, spellGrade, castMethod, increasedZeon = { accumulated: 0, pool: 0 }) {
    if (!this.canCastSpell(spell, spellGrade, castMethod, increasedZeon)) return;
    if (castMethod !== 'override') {
      this.consumeZeon(increasedZeon.pool);
    }
    if (castMethod === 'prepared') {
      this.deletePreparedSpell(spell.name, spellGrade);
      return;
    }
    if (castMethod === 'accumulated') {
      const zeon =
        spell?.system.grades[spellGrade].zeon.value + increasedZeon.accumulated;
      this.consumeAccumulatedZeon(zeon);
    }
  }

  /**
   * Consumes zeon from an actor's zeon pool.
   * @param {number} zeon - The amount of zeon to be consumed.
   */
  consumeZeon(zeon) {
    const newZeon = this.system.mystic.zeon.value - zeon;
    this.update({
      system: {
        mystic: {
          zeon: { value: newZeon }
        }
      }
    });
  }

  /**
   * Updates the accumulated zeon value of a mystic character by subtracting the zeon cost of a spell.
   *
   * @param {number} zeonCost The amount of zeon to be consumed.
   */
  consumeAccumulatedZeon(zeonCost) {
    const newAccumulateZeon = this.system.mystic.zeon.accumulated - zeonCost;

    this.update({
      system: {
        mystic: {
          zeon: { accumulated: newAccumulateZeon }
        }
      }
    });
  }

  /**
   * Consumes or restores the amount of maintained Zeon for a Mystic character.
   * Used in every turn change in ABFCombat.
   *
   * @param {boolean} revert A flag indicating whether to consume or restore the maintained Zeon. If `true`, the maintained Zeon will be restored to the character's total Zeon value. If `false`, the maintained Zeon will be consumed from the character's total Zeon value.
   * @returns A promise that resolves when the update is complete.
   */
  async consumeMaintainedZeon(revert) {
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

  /**
   * Deletes a prepared spell from the `mystic.preparedSpells` array of the `ABFActor` class.
   *
   * @param {string} spellName The name of the spell to be deleted.
   * @param {string} spellGrade The grade of the spell to be deleted.
   * @returns The method updates the `mystic.preparedSpells` array of the actor.
   */
  deletePreparedSpell(spellName, spellGrade) {
    let preparedSpellId = this.system.mystic.preparedSpells.find(
      ps =>
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
      return this.update(dataToUpdate);
    }
  }

  /**
   * Updates the `lifePoints` attribute of an `ABFActor` object by subtracting the specified `damage` value.
   * @param {number} damage - The amount of damage to be subtracted from the `lifePoints` attribute.
   */
  applyDamage(damage) {
    if (!damage) return;
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

  /**
   *  @param {Object} data
   *  @param {import('../items/ABFItems').ABFItemsEnum} data.type
   *  @param {string} data.name
   *  @param {ABFItem["system"]} data.system
   */
  async createItem({ type, name, system = {} }) {
    const items = await this.createEmbeddedDocuments('Item', [
      {
        type,
        name,
        system
      }
    ]);
    return items[0];
  }

  /**
   *  @param {Object} data
   *  @param {import('../items/ABFItems').ABFItemsEnum} data.type
   *  @param {string} data.name
   *  @param {Record<string, unknown>} data.system
   */
  async createInnerItem({ type, name, system = {} }) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    const items = getFieldValueFromPath(this.system, configuration.fieldPath) ?? [];

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

  /**
   * @param {string} id
   */
  async deleteItem(id) {
    const item = this.getItem(id);

    if (item) {
      await item.delete();
    }
  }

  /**
   *  @param {Object} data
   *  @param {import('../items/ABFItems').ABFItemsEnum} data.type
   *  @param {string} data.name
   *  @param {ABFItem["system"]} data.system
   */
  async updateItem({ id, name, system = {} }) {
    const item = this.getItem(id);

    if (item) {
      let updateObject = { system };

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

  /**
   *  @param {Object} data
   *  @param {import('../items/ABFItems').ABFItemsEnum} data.type
   *  @param {string} data.id
   *  @param {string} data.name
   *  @param {Record<string, unknown>} data.system
   *  @param {boolean} forceSave
   */
  async updateInnerItem({ type, id, name, system = {} }, forceSave = false) {
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
          item.system = foundry.utils.mergeObject(item.system, system);
        }

        await this.update({
          system: getUpdateObjectFromPath(items, configuration.fieldPath)
        });
      }
    }
  }

  /**
   * @param {import('../items/ABFItems').ABFItemsEnum} data.type
   * @param {string} itemId
   */
  getInnerItem(type, itemId) {
    return this.getItemsOf(type).find(item => item._id === itemId);
  }

  getSecondarySpecialSkills() {
    return this.getItemsOf(ABFItems.SECONDARY_SPECIAL_SKILL);
  }

  getKnownSpells(combatType) {
    if (combatType) {
      return this.getItemsOf(ABFItems.SPELL).filter(
        w => w.system.combatType.value === combatType
      );
    }
    return this.getItemsOf(ABFItems.SPELL);
  }

  getSpellMaintenances() {
    return this.getItemsOf(ABFItems.SPELL_MAINTENANCE);
  }

  getSelectedSpells() {
    return this.getItemsOf(ABFItems.SELECTED_SPELL);
  }

  getActVias() {
    return this.getItemsOf(ABFItems.ACT_VIA);
  }

  getInnateMagicVias() {
    return this.getItemsOf(ABFItems.INNATE_MAGIC_VIA);
  }

  getPreparedSpells() {
    return this.getItemsOf(ABFItems.PREPARED_SPELL);
  }

  getSupernaturalShields() {
    return this.getItemsOf(ABFItems.SUPERNATURAL_SHIELD);
  }

  getKnownMetamagics() {
    return this.getItemsOf(ABFItems.METAMAGIC);
  }

  getKnownSummonings() {
    return this.getItemsOf(ABFItems.SUMMON);
  }

  getCategories() {
    return this.getItemsOf(ABFItems.LEVEL);
  }

  getKnownLanguages() {
    return this.getItemsOf(ABFItems.LANGUAGE);
  }

  getElans() {
    return this.getItemsOf(ABFItems.ELAN);
  }

  getElanPowers() {
    return this.getItemsOf(ABFItems.ELAN_POWER);
  }

  getTitles() {
    return this.getItemsOf(ABFItems.TITLE);
  }

  getAdvantages() {
    return this.getItemsOf(ABFItems.ADVANTAGE);
  }

  getDisadvantages() {
    return this.getItemsOf(ABFItems.DISADVANTAGE);
  }

  getContacts() {
    return this.getItemsOf(ABFItems.CONTACT);
  }

  getNotes() {
    return this.getItemsOf(ABFItems.NOTE);
  }

  getPsychicDisciplines() {
    return this.getItemsOf(ABFItems.PSYCHIC_DISCIPLINE);
  }

  getMentalPatterns() {
    return this.getItemsOf(ABFItems.MENTAL_PATTERN);
  }

  getInnatePsychicPowers() {
    return this.getItemsOf(ABFItems.INNATE_PSYCHIC_POWER);
  }

  getPsychicPowers(combatType) {
    if (combatType) {
      return this.getItemsOf(ABFItems.PSYCHIC_POWER).filter(
        w => w.system.combatType.value === combatType
      );
    }
    return this.getItemsOf(ABFItems.PSYCHIC_POWER);
  }

  getKiSkills() {
    return this.getItemsOf(ABFItems.KI_SKILL);
  }

  getNemesisSkills() {
    return this.getItemsOf(ABFItems.NEMESIS_SKILL);
  }

  getArsMagnus() {
    return this.getItemsOf(ABFItems.ARS_MAGNUS);
  }

  getMartialArts() {
    return this.getItemsOf(ABFItems.MARTIAL_ART);
  }

  getKnownCreatures() {
    return this.getItemsOf(ABFItems.CREATURE);
  }

  getSpecialSkills() {
    return this.getItemsOf(ABFItems.SPECIAL_SKILL);
  }

  getKnownTechniques() {
    return this.getItemsOf(ABFItems.TECHNIQUE);
  }

  getCombatSpecialSkills() {
    return this.getItemsOf(ABFItems.COMBAT_SPECIAL_SKILL);
  }

  getCombatTables() {
    return this.getItemsOf(ABFItems.COMBAT_TABLE);
  }

  getAmmos() {
    return this.getItemsOf(ABFItems.AMMO);
  }

  getWeapons() {
    return this.getItemsOf(ABFItems.WEAPON);
  }

  getArmors() {
    return this.getItemsOf(ABFItems.ARMOR);
  }

  getInventoryItems() {
    return this.getItemsOf(ABFItems.INVENTORY_ITEM);
  }

  getAllItems() {
    return Object.values(ABFItems).flatMap(itemType => this.getItemsOf(itemType));
  }

  _getSheetClass() {
    return ABFActorSheet;
  }

  /**
   * @param {import('../items/ABFItems').ABFItemsEnum} type
   * @returns {ABFItem[]}
   * @TODO: Improve return type
   */
  getItemsOf(type) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    if (!configuration) {
      Logger.error(`No configuration found for item type ${type}`);

      return [];
    }

    if (configuration.isInternal) {
      return this.getInnerItems(type);
    }

    return this.items.filter(i => i.type === type);
  }

  /**
   * @param {import('../items/ABFItems').ABFItemsEnum} type
   * @TODO: Improve return type
   */
  getInnerItems(type) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    if (!configuration) {
      Logger.error(`No configuration found for item type ${type}`);

      return [];
    }

    if (configuration.fieldPath.length === 0) {
      return [];
    }

    const items = getFieldValueFromPath(this.system, configuration.fieldPath);

    if (Array.isArray(items)) {
      return items.map(migrateItem);
    }

    return [];
  }

  /**
   * @param {ABFItem["id"]} itemId
   */
  getItem(itemId) {
    return this.getEmbeddedDocument('Item', itemId);
  }

  /**
   * Returns the last weapon used if still available, otherwise undefined.
   * @param {"offensive" | "defensive"} usage Whether to retrieve the last weapon used for attacking
   * or defending
   */
  getLastWeaponUsed(usage) {
    usage = usage[0].toUpperCase() + usage.slice(1);
    const lastWeaponUsed = this.getFlag('animabf', `last${usage}WeaponUsed`);

    return this.getWeapons().find(w => w.id === lastWeaponUsed);
  }
  /**
   * Returns the last spell used if still available, otherwise undefined.
   * @param {"offensive" | "defensive"} usage Whether to retrieve the last spell used for attacking
   * or defending
   */
  getLastSpellUsed(usage) {
    usage = usage[0].toUpperCase() + usage.slice(1);
    const lastSpellUsed = this.getFlag('animabf', `last${usage}SpellUsed`);

    return this.getKnownSpells().find(w => w.id === lastSpellUsed);
  }
  /**
   * Returns the last psychic power used if still available, otherwise undefined.
   * @param {"offensive" | "defensive"} usage Whether to retrieve the last psychic power used for attacking
   * or defending
   */
  getLastPowerUsed(usage) {
    usage = usage[0].toUpperCase() + usage.slice(1);
    const lastPowerUsed = this.getFlag('animabf', `last${usage}PowerUsed`);

    return this.getPsychicPowers().find(w => w.id === lastPowerUsed);
  }

  getCastMethodOverride() {
    return this.getFlag('animabf', 'castMethodOverride');
  }

  /**
   * Sets the last weapon used to a flag.
   * @param {ABFItem} weapon
   * @param {"offensive" | "defensive"} usage Whether to save the last weapon used for attacking
   * or defending
   */
  setLastWeaponUsed(weapon, usage) {
    usage = usage[0].toUpperCase() + usage.slice(1);
    this.setFlag('animabf', `last${usage}WeaponUsed`, weapon.id);
  }
  /**
   * Sets the last spell used to a flag.
   * @param {ABFItem} spell
   * @param {"offensive" | "defensive"} usage Whether to save the last spell used for attacking
   * or defending
   */
  setLastSpellUsed(spell, usage) {
    usage = usage[0].toUpperCase() + usage.slice(1);
    this.setFlag('animabf', `last${usage}SpellUsed`, spell.id);
  }
  /**
   * Sets the last psychic power used to a flag.
   * @param {ABFItem} power
   * @param {"offensive" | "defensive"} usage Whether to save the last psychic power used for attacking
   * or defending
   */
  setLastPowerUsed(power, usage) {
    usage = usage[0].toUpperCase() + usage.slice(1);
    this.setFlag('animabf', `last${usage}PowerUsed`, power.id);
  }
  /**
   * @param {"override" | "accumulated" | "innate" | "prepared"} castMethod
   */
  setCastMethodOverride(castMethod) {
    this.setFlag('animabf', 'castMethodOverride', castMethod === 'override');
  }
}
