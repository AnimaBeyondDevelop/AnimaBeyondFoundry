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
import { difficultyAchieved } from '../combat/utils/difficultyAchieved.js';
import { psychicFatigueCheck } from '../combat/utils/psychicFatigueCheck.js';
import { shieldBaseValueCheck } from '../combat/utils/shieldBaseValueCheck.js';
import { shieldValueCheck } from '../combat/utils/shieldValueCheck.js';
import { withstandPainBonus } from '../combat/utils/withstandPainBonus.js';
import { SpellCasting } from '../types/mystic/SpellItemConfig.js';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll';
import { openModDialog } from '../utils/dialogs/openSimpleInputDialog';
import { openComplexInputDialog } from '../utils/dialogs/openComplexInputDialog';

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

  applyCriticEffect(criticLevel: number) {
    const { pain } = this.system.general.modifiers;
    const newPhysicalPain =
      pain.physical.value - (criticLevel <= 50 ? criticLevel : Math.round(criticLevel / 2));
    const newIncapacitationPain =
      pain.incapacitation.value - (criticLevel > 50 ? Math.round(criticLevel / 2) : 0);

    this.update({
      system: {
        general: {
          modifiers: { pain: { physical: { value: newPhysicalPain }, incapacitation: { value: newIncapacitationPain } } }
        }
      }
    });
  }

  async withstandPain(sendToChat = true) {
    const { pain } = this.system.general.modifiers;
    const withstandPainRoll = await this.rollAbility('withstandPain', 0, sendToChat)
    const { inhuman, zen } = this.system.general.settings;
    const withstandPainTotal = difficultyAchieved(withstandPainRoll, 0, inhuman, zen)
    const withstandPain = withstandPainBonus(withstandPainTotal)
    const newWithstandPain =
      pain.withstandPain.value > withstandPain ? pain.withstandPain.value : withstandPain;

    this.update({
      system: {
        general: {
          modifiers: { pain: { withstandPain: { value: newWithstandPain } } }
        }
      }
    });
    return newWithstandPain
  }

  physicalPainDisappearing(reset: boolean) {
    const { pain } = this.system.general.modifiers;
    const newPhysicalPain = pain.physical.value + 5;
    if (reset) {
      this.update({
        system: {
          general: {
            modifiers: { pain: { physical: { value: 0 } } }
          }
        }
      });
    } else {
      this.update({
        system: {
          general: {
            modifiers: { pain: { physical: { value: Math.min(newPhysicalPain, 0) } } }
          }
        }
      });
    }
  }

  async applyHealingFactor(days: number = 1, resting?: boolean) {
    const { incapacitation } = this.system.general.modifiers.pain;
    const { regeneration, lifePoints } = this.system.characteristics.secondaries;

    this.update({
      system: {
        general: {
          modifiers: {
            pain: {
              incapacitation: { value: Math.min(incapacitation.value - regeneration.recovery.value * days, 0) }
            }
          }
        },
        characteristics: {
          secondaries: {
            lifePoints: {
              value: Math.min(lifePoints.value + regeneration[resting ? 'resting' : 'normal'].value * days, lifePoints.max)
            }
          }
        }
      }
    });
  }

  async restByDays(days: number = 1, resting?: boolean) {
    const { zeon, act } = this.system.mystic;
    const { fatigue } = this.system.characteristics.secondaries;

    await this.update({
      system: {
        characteristics: {
          secondaries: {
            fatigue: {
              value: fatigue.max
            }
          }
        },
        mystic: {
          zeon: {
            value: Math.min(zeon.value + act.main.final.value * days, zeon.max)
          }
        }
      }
    });

    await this.applyHealingFactor(days, resting)
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
  async rollAbility(ability: string, bonus = 0, sendToChat = true) {
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
    const mod = await openModDialog(name);
    let formula = `1d100xa + ${abilityValue} + ${mod + bonus ?? 0}`;
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

  async rollABF(value: number, name = '', bonus = 0, sendToChat = true) {
    const label = name ? `Rolling ${name}` : '';
    const mod = await openModDialog(name);
    let formula = `1d100xa + ${value} + ${mod + bonus ?? 0}`;
    if (value >= 200) formula = formula.replace('xa', 'xamastery');
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

  /**
   * Creates a new supernatural shield item for the ABFActor class and execute a macro using the shield's name.
   * 
   * @param {string} type - The type of the supernatural shield ('psychic' or 'mystic').
   * @param {any} power - The power object containing information about the psychic power. Only needed if type = 'psychic'.
   * @param {number} psychicDifficulty - The difficulty level of the psychic power. Only needed if type = 'psychic'.
   * @param {any} spell - The spell object containing information about the mystic spell. Only needed if type = 'mystic'.
   * @param {string} spellGrade - The grade of the mystic spell. Only needed if type = 'mystic'.
   * @returns {Promise<string>} - The ID of the newly created supernatural shield item.
   */
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

      const potentialBaseDifficulty = difficultyAchieved(
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
   * @param supShieldId - The ID of the supernatural shield item to be deleted.
   * @returns {void} 
   */
  async deleteSupernaturalShield(supShieldId: string) {
    const supShield = this.getItem(supShieldId);
    if (supShield) {
      this.deleteItem(supShieldId)
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
   * @param {object} [newCombatResult] - Additional combat result data used to calculate damage to the actor if the shield breaks.
   * 
   * @returns {void}
   */
  async applyDamageSupernaturalShield(
    supShieldId: string,
    damage: number,
    dobleDamage?: boolean,
    newCombatResult?: any
  ) {
    const supShield = this.getItem(supShieldId);
    const shieldValue = supShield?.system.shieldPoints;
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

  /**
   * Evaluates the psychic fatigue caused by using a power in the game.
   * It checks if the actor has immunity to fatigue and calculates the fatigue value based on the power's effects and the psychic difficulty.
   * If the actor is not immune to fatigue, it applies the fatigue value to the actor's characteristics.
   * 
   * @param {object} power - The power for which the psychic fatigue is being evaluated.
   * @param {number} psychicDifficulty - The difficulty level of the psychic power.
   * @param {boolean} eliminateFatigue - Whether to apply the fatigue value or not to the actor's characteristics.
   * @param {boolean} sendToChat - Whether to send a chat message or not. Default is `true`.
   * 
   * @returns {number} The calculated psychic fatigue value.
   */
  async evaluatePsychicFatigue(power: any, psychicDifficulty: number, eliminateFatigue: boolean, sendToChat = true) {
    const { psychic: { psychicSettings: { fatigueResistance }, psychicPoints } } = this.system
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
      if (!psychicFatigue.inmune && !eliminateFatigue) {
        this.applyFatigue(psychicFatigue.value - psychicPoints.value);
        this.update({
          system: {
            psychic: {
              psychicPoints: { value: Math.max(psychicPoints.value - psychicFatigue.value, 0) }
            }
          }
        })
      }
    }
    if (eliminateFatigue) {
      this.update({
        system: {
          psychic: {
            psychicPoints: { value: psychicPoints.value - 1 }
          }
        }
      })
    }

    return psychicFatigue.value;
  }

  /**
   * Performs maintenance on psychic shields by checking if they are overmaintained or need to be damaged.
   * If a psychic shield is overmaintained, it is either unset or damaged based on the `revert` parameter.
   * Its executed in every next turn in ABFCombat, if the combat goes to a previous turn the 'revert' parameter is set to true.
   * 
   * @param revert - A flag indicating whether to revert the maintenance or not.
   * @returns {void}
   */
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
          this.applyDamageSupernaturalShield(supShield.id, damage, false, undefined);
        }
      }
    }
  }

  /**
   * Updates the defenses counter for an actor based on the value of the `keepAccumulating` parameter.
   * 
   * @param {boolean} keepAccumulating - A flag indicating whether to continue accumulating defenses or not.
   * @returns {void}
   */
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

  /**
   * Resets the accumulated defenses counter for an ABFActor object.
   * 
   * @example
   * const actor = new ABFActor(data, context);
   * actor.resetDefensesCounter();
   * 
   * @returns {void} 
   */
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

  /**
   * Determines if a mystic character can cast a specific spell at a specific grade.
   * 
   * @param spell - The spell object that contains information about the spell, including the zeon cost for each grade.
   * @param spellGrade - The grade of the spell that the character wants to cast.
   * @param casted - An object that indicates whether the spell has been casted before, either as a prepared spell or an innate spell. Default is { prepared: false, innate: false }.
   * @param override - A flag that indicates whether to override the normal casting rules and allow the spell to be casted regardless of zeon points or previous casting. Default is false.
   * @returns {SpellCasting} - An object that contains information about the zeon points, whether the spell can be cast (prepared or innate), if the spell has been casted, and whether the casting rules should be overridden.
   */
  mysticCanCastEvaluate(spell: any, spellGrade: string, casted = { prepared: false, innate: false }, override = false) {
    const spellCasting = SpellCasting;
    spellCasting.casted = casted
    spellCasting.override = override
    spellCasting.zeon.accumulated = this.system.mystic.zeon.accumulated.value ?? 0;

    if (override) { return spellCasting };

    spellCasting.zeon.cost = spell?.system.grades[spellGrade].zeon.value;
    spellCasting.canCast.prepared =
      this.system.mystic.preparedSpells.find(
        ps => ps.name === spell.name && ps.system.grade.value === spellGrade
      )?.system.prepared.value ?? false;
    const spellVia = spell?.system.via.value;
    const innateMagic = this.system.mystic.innateMagic;
    const innateVia = innateMagic.via.find(i => i.name === spellVia);
    const innateMagicValue =
      innateMagic.via.length !== 0 && innateVia
        ? innateVia.system.final.value
        : innateMagic.main.final.value;
    spellCasting.canCast.innate = innateMagicValue >= spellCasting.zeon.cost;

    if (!spellCasting.canCast.innate) {
      spellCasting.casted.innate = false;
    }
    if (!spellCasting.canCast.prepared) {
      spellCasting.casted.prepared = false;
    }
    return spellCasting;
  }

  /**
   * Evaluates the spell casting conditions and returns a boolean value indicating whether the spell can be cast or not.
   * 
   * @param {SpellCasting} spellCasting - - An object that contains information about the zeon points, whether the spell can be cast (prepared or innate), if the spell has been casted, and whether the casting rules should be overridden.
   * @returns {boolean} - A boolean value indicating whether the spell can be cast or not.
   */
  evaluateCast(spellCasting: SpellCasting) {
    const { i18n } = game;
    const { canCast, casted, zeon, override } = spellCasting;
    if (override) {
      return false;
    }
    if (canCast?.innate && casted?.innate && canCast?.prepared && casted?.prepared) {
      ui.notifications.warn(
        i18n.localize('dialogs.spellCasting.warning.mustChoose')
      );
      return true;
    }
    if (canCast?.innate && casted?.innate) {
      return;
    } else if (!canCast?.innate && casted?.innate) {
      ui.notifications.warn(
        i18n.localize('dialogs.spellCasting.warning.innateMagic')
      );
      return true;
    } else if (canCast?.prepared && casted?.prepared) {
      return false;
    } else if (!canCast?.prepared && casted?.prepared) {
      return ui.notifications.warn(
        i18n.localize('dialogs.spellCasting.warning.preparedSpell')
      );
    } else if (zeon.accumulated < zeon.cost) {
      ui.notifications.warn(
        i18n.localize('dialogs.spellCasting.warning.zeonAccumulated')
      );
      return true;
    } else return false;
  };

  async mysticAct(act: number, spellID?: string, spellGrade?: string, preapredSpellId?: string) {
    const { zeon, spells, preparedSpells } = this.system.mystic;
    let spareAct = 0;
    let accumulatedFullZeon = 0

    if (spellID) {
      const spell = spells.find(w => w._id === spellID);
      const zeonCost = spell.system.grades[spellGrade || 'base'].zeon.value
      spareAct = act - zeonCost
      this.createInnerItem({
        type: ABFItems.PREPARED_SPELL,
        name: spell.name,
        system: {
          grade: { value: spellGrade },
          zeonAcc: { value: act, max: zeonCost },
          prepared: { value: spareAct >= 0 },
          via: { value: spell.system.via.value }
        }
      })
    } else if (preapredSpellId) {
      const preapredSpell = preparedSpells.find(w => w._id === preapredSpellId);

      spareAct = preapredSpell.system.zeonAcc.value + act - preapredSpell.system.zeonAcc.max;

      this.updateInnerItem({
        type: ABFItems.PREPARED_SPELL,
        id: preapredSpellId,
        system: {
          zeonAcc: { value: preapredSpell.system.zeonAcc.value + act },
          prepared: { value: spareAct >= 0 }
        }
      })
    } else { accumulatedFullZeon = act }

    const finalAct = spareAct >= 0 ? act - spareAct : act;
    this.update({
      system: {
        mystic: {
          zeon: { accumulated: { value: (zeon.accumulated.value + accumulatedFullZeon) }, value: (zeon.value - finalAct) }
        }
      }
    })
    executeMacro('ACT', { thisActor: this });
    return spareAct;
  }

  async releaseAct(all?: boolean, noReturnedZeon?: boolean) {
    const { zeon, preparedSpells } = this.system.mystic;

    let returnedZeon = Math.max(zeon.accumulated.value - 10, 0)

    let ids: string[] = [];

    for (const prepareSpell of preparedSpells) {
      if (all) {
        returnedZeon += Math.max(prepareSpell.system.zeonAcc.value - 10, 0);
      } else if (!prepareSpell.system.prepared.value) {
        returnedZeon += Math.max(prepareSpell.system.zeonAcc.value - 10, 0);
        ids.push(prepareSpell._id);
      }
    }

    returnedZeon = noReturnedZeon ? 0 : returnedZeon

    if (all) {
      this.deleteInnerItem(ABFItems.PREPARED_SPELL, undefined, all)
    } else {
      this.deleteInnerItem(ABFItems.PREPARED_SPELL, ids)
    }

    this.update({
      system: {
        mystic: {
          zeon: { accumulated: { value: 0 }, value: (zeon.value + returnedZeon) }
        }
      }
    })
    executeMacro('ACT', { thisActor: this, releaseAct: true });
  }

  async zeonWithstandPain(sendToChat = true) {
    const { i18n } = game;
    const { preparedSpells } = this.system.mystic;
    const bonus = preparedSpells.length > 0 ? 40 : 0;
    const withstandPainRoll = await this.rollAbility('withstandPain', bonus, sendToChat)
    const damage: any = this.getFlag('animabf', 'lastDamageApplied') ?? 0

    let flavor = i18n.format('macros.dialog.zeonWithstandPain.succeed.title')

    if (withstandPainRoll !== undefined) {
      if (withstandPainRoll < damage) {
        this.releaseAct(true, true)
        flavor = i18n.format('macros.dialog.zeonWithstandPain.criticalFail.title');
        executeMacro('ACT', { thisActor: this, loseZeon: true });
      } else if (withstandPainRoll < damage * 2) {
        this.releaseAct(true)
        flavor = i18n.format('macros.dialog.zeonWithstandPain.failed.title');
        executeMacro('ACT', { thisActor: this, releaseAct: true });
      }
    }
    if (sendToChat) {
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor
      });
    }
    return
  }

  /**
   * Handles the casting of mystic spells by an actor in the ABFActor class.
   * 
   * @param {SpellCasting} spellCasting - An object that contains information about the zeon points, whether the spell can be cast (prepared or innate), if the spell has been casted, and whether the casting rules should be overridden.
   * @param spellName - The name of the spell being casted.
   * @param spellGrade - The grade of the spell being casted.
   * 
   * @returns {void}
   */
  mysticCast(spellCasting: SpellCasting, spellName: string, spellGrade: string) {
    const { zeon, casted, override } = spellCasting;
    if (override) {
      return;
    }
    if (casted.innate) {
      return;
    }
    if (casted.prepared) {
      this.deletePreparedSpell(spellName, spellGrade);
    } else {
      this.consumeAccumulatedZeon(zeon.cost);
    }
  }

  /**
   * Updates the accumulated zeon value of a mystic character by subtracting the zeon cost of a spell.
   * 
   * @param {number} zeonCost - The amount of zeon to be consumed.
   * @returns {void}
   */
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

  /**
   * Consumes or restores the amount of maintained Zeon for a Mystic character.
   * Used in every turn change in ABFCombat.
   * 
   * @param {boolean} revert - A flag indicating whether to consume or restore the maintained Zeon. If `true`, the maintained Zeon will be restored to the character's total Zeon value. If `false`, the maintained Zeon will be consumed from the character's total Zeon value.
   * @returns A promise that resolves when the update is complete.
   */
  async consumeMaintainedZeon(revert: boolean) {
    const { zeon, zeonMaintained } = this.system.mystic;
    const updatedZeon = revert
      ? zeon.value + zeonMaintained.final.value
      : zeon.value - zeonMaintained.final.value;

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
   * @param spellName - The name of the spell to be deleted.
   * @param spellGrade - The grade of the spell to be deleted.
   * @returns None. The method updates the `mystic.preparedSpells` array of the actor.
   */
  async deletePreparedSpell(spellName: string, spellGrade: string) {
    let preparedSpellId = this.system.mystic.preparedSpells.find(
      (ps: any) =>
        ps.name === spellName &&
        ps.system.grade.value === spellGrade &&
        ps.system.prepared.value === true
    )?._id;
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
   * @returns {void}
   * @example
   */
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
    this.setFlag('animabf', 'lastDamageApplied', damage);
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

  async deleteInnerItem(type: string, ids?: string[], deleteAll?: boolean) {
    if (!type) {
      return
    };
    const configuration = ALL_ITEM_CONFIGURATIONS[type];
    const items = this.getInnerItems(type);

    if (deleteAll) {
      const dataToUpdate = {
        system: getUpdateObjectFromPath([], configuration.fieldPath)
      };
      await this.update(dataToUpdate);

    } else if (ids !== undefined) {

      await this.update({
        system: getUpdateObjectFromPath(
          [
            ...items.filter(i => !ids.includes(i._id))
          ],
          configuration.fieldPath
        )
      });
    }
    return
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
  public getMaintainedSpells() {
    return this.getItemsOf(ABFItems.MAINTAINED_SPELL);
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
