import { Templates } from '../../utils/constants';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { NoneWeaponCritic, WeaponCritic } from '../../types/combat/WeaponItemConfig';
import { energyCheck } from '../../combat/utils/energyCheck.js';
import { mysticSpellCastEvaluate } from '../../combat/utils/mysticSpellCastEvaluate.js';
import { evaluateCast } from '../../combat/utils/evaluateCast.js';
import { psychicFatigue } from '../../combat/utils/psychicFatigue.js';
import { psychicImbalanceCheck } from '../../combat/utils/psychicImbalanceCheck.js';
import { psychicPotentialEffect } from '../../combat/utils/psychicPotentialEffect.js';
import { shieldBaseValueCheck } from '../../combat/utils/shieldBaseValueCheck.js';
import { shieldValueCheck } from '../../combat/utils/shieldValueCheck.js';
import { shieldSupernaturalCheck } from '../../combat/utils/shieldSupernaturalCheck.js';
import { defensesCounterCheck } from '../../combat/utils/defensesCounterCheck.js';
import { ABFSettingsKeys } from '../../../utils/registerSettings';

const getInitialData = (attacker, defender) => {
  const showRollByDefault = !!game.settings.get(
    'animabf',
    ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
  );
  const isGM = !!game.user?.isGM;

  const attackerActor = attacker.token.actor;
  const defenderActor = defender.actor;

  const activeTab =
    defenderActor.system.general.settings.defenseType.value === 'resistance'
      ? 'damageResistance'
      : 'combat';

  const defensesCounter = defenderActor.getFlag('animabf', 'defensesCounter') || {
    accumulated: 0,
    keepAccumulating: true
  };

  return {
    ui: {
      isGM,
      hasFatiguePoints:
        defenderActor.system.characteristics.secondaries.fatigue.value > 0,
      activeTab
    },
    attacker: {
      token: attacker.token,
      actor: attackerActor,
      attackType: attacker.attackType,
      critic: attacker.critic,
      visible: attacker.visible,
      projectile: attacker.projectile,
      damage: attacker.damage,
      specialType: attacker.specialType
    },
    defender: {
      token: defender,
      actor: defenderActor,
      showRoll: !isGM || showRollByDefault,
      withoutRoll: defenderActor.system.general.settings.defenseType.value === 'mass',
      blindnessPen: 0,
      distance: attacker.distance,
      zen: defenderActor.system.general.settings.zen.value,
      inhuman: defenderActor.system.general.settings.inhuman.value,
      inmaterial: defenderActor.system.general.settings.inmaterial.value,
      specialType: {
        material: true,
        inmaterial: false,
        intangible: false,
        energy: false,
        materialEnergy: true,
        attackSpellLight: false,
        attackSpellDarkness: false
      },
      combat: {
        fatigue: 0,
        multipleDefensesPenalty: defensesCounterCheck(defensesCounter.accumulated),
        accumulateDefenses: defensesCounter.keepAccumulating,
        modifier: 0,
        weaponUsed: undefined,
        weapon: undefined,
        unarmed: false,
        at: {
          special: 0,
          final: 0,
          defense: attacker.critic !== NoneWeaponCritic.NONE && attacker.damage == 0
        }
      },
      mystic: {
        modifier: 0,
        magicProjection: {
          base: defenderActor.system.mystic.magicProjection.imbalance.defensive.base
            .value,
          final:
            defenderActor.system.mystic.magicProjection.imbalance.defensive.final.value
        },
        spellUsed: undefined,
        spellGrade: 'base',
        spellCasting: {
          zeon: { accumulated: 0, cost: 0 },
          spell: { prepared: false, innate: false },
          cast: { prepared: false, innate: false },
          override: { value: false, ui: false }
        },
        shieldUsed: undefined,
        shieldValue: 0,
        newShield: false
      },
      psychic: {
        modifier: 0,
        psychicPotential: {
          special: 0,
          base: defenderActor.system.psychic.psychicPotential.base.value,
          final: defenderActor.system.psychic.psychicPotential.final.value
        },
        psychicProjection:
          defenderActor.system.psychic.psychicProjection.imbalance.defensive.final.value,
        powerUsed: undefined,
        shieldUsed: undefined,
        shieldValue: 0,
        newShield: false
      },
      resistance: {
        surprised: false
      }
    },
    defenseSent: false
  };
};

export class CombatDefenseDialog extends FormApplication {
  constructor(attacker, defender, hooks) {
    super(getInitialData(attacker, defender));

    this.modalData = getInitialData(attacker, defender);
    this._tabs[0].callback = (event, tabs, tabName) => {
      this.modalData.ui.activeTab = tabName;
      this.render(true);
    };

    const { psychic, mystic, combat } = this.modalData.defender;
    const { weapons } = this.defenderActor.system.combat;
    const { spells, mysticShields } = this.defenderActor.system.mystic;
    const { psychicPowers, psychicShields } = this.defenderActor.system.psychic;

    if (psychicPowers.length > 0) {
      const lastDefensivePowerUsed = this.defenderActor.getFlag(
        'animabf',
        'lastDefensivePowerUsed'
      );
      if (psychicPowers.find(w => w._id === lastDefensivePowerUsed)) {
        psychic.powerUsed = lastDefensivePowerUsed;
      } else {
        psychic.powerUsed = psychicPowers.find(
          w => w.system.combatType.value === 'defense'
        )?._id;
      }
      const power = psychicPowers.find(w => w._id === psychicPowers.powerUsed);
      this.defenderActor.system.psychic.psychicPotential.special =
        power?.system.bonus.value;
    }

    if (psychicShields.length > 0) {
      const psychicShield = psychicShields.filter(
        w => w.system.shieldPoints?.value > 0
      )[0];
      psychic.shieldUsed = psychicShield?._id;
      psychic.shieldValue = psychicShield?.system.shieldPoints?.value;
    } else {
      psychic.newShield = true;
    }

    if (spells.length > 0) {
      const lastDefensiveSpellUsed = this.defenderActor.getFlag(
        'animabf',
        'lastDefensiveSpellUsed'
      );
      if (spells.find(w => w._id === lastDefensiveSpellUsed)) {
        mystic.spellUsed = lastDefensiveSpellUsed;
      } else {
        mystic.spellUsed = spells.find(w => w.system.combatType.value === 'defense')?._id;
      }
      const spell = spells.find(w => w._id === mystic.spellUsed);
      mystic.spellCasting.zeon.accumulated =
        this.defenderActor.system.mystic.zeon.accumulated.value ?? 0;
      const mysticSpellCheck = mysticSpellCastEvaluate(
        this.defenderActor,
        spell,
        mystic.spellGrade
      );
      mystic.spellCasting.spell = mysticSpellCheck;
      const spellCastingOverride = this.defenderActor.getFlag(
        'animabf',
        'spellCastingOverride'
      );
      mystic.spellCasting.override.value = spellCastingOverride || false;
      mystic.spellCasting.override.ui = spellCastingOverride || false;
    }

    if (mysticShields.length > 0) {
      mystic.shieldUsed = mysticShields.find(w => w.system.shieldPoints?.value > 0)?._id;
    } else {
      mystic.newShield = true;
    }

    if (weapons.length > 0) {
      const lastDefensiveWeaponUsed = this.defenderActor.getFlag(
        'animabf',
        'lastDefensiveWeaponUsed'
      );
      if (weapons.find(weapon => weapon._id == lastDefensiveWeaponUsed)) {
        combat.weaponUsed = lastDefensiveWeaponUsed;
      } else {
        combat.weaponUsed = weapons[0]._id;
      }
    } else {
      combat.unarmed = true;
    }
    const perceiveMystic =
      this.defenderActor.system.general.settings.perceiveMystic.value;
    const perceivePsychic =
      this.defenderActor.system.general.settings.perceivePsychic.value;
    let blindness = false;
    let attackType = this.modalData.attacker.attackType;
    if (!this.modalData.attacker.visible) {
      if (!perceiveMystic && !perceivePsychic) {
        blindness = true;
      } else if (attackType === 'mystic' && !perceiveMystic) {
        blindness = true;
      } else if (attackType === 'psychic' && !perceivePsychic) {
        blindness = true;
      }
    }
    if (blindness) {
      if (
        !this.defenderActor.effects.find(i => i.name === 'Ceguera absoluta') &&
        !this.defenderActor.effects.find(i => i.name === 'Ceguera parcial')
      ) {
        this.modalData.defender.blindnessPen = -80;
      } else if (!this.defenderActor.effects.find(i => i.name === 'Ceguera absoluta')) {
        this.modalData.defender.blindnessPen = -50;
      }
    }

    let critic = this.modalData.attacker.critic;
    let at = this.defenderActor.system.combat.totalArmor.at[critic]?.value;

    if (at !== undefined) {
      combat.at.final = combat.at.special + at;
    }

    this.hooks = hooks;

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['abf-dialog combat-defense-dialog no-close'],
      submitOnChange: true,
      closeOnSubmit: false,
      width: 525,
      height: 240,
      resizable: true,
      template: Templates.Dialog.Combat.CombatDefenseDialog.main,
      title: game.i18n.localize('macros.combat.dialog.defending.defend.title'),
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'combat'
        }
      ]
    });
  }

  get attackerActor() {
    return this.modalData.attacker.token.actor;
  }

  get defenderActor() {
    return this.modalData.defender.token.actor;
  }

  async close(options) {
    if (options?.force) {
      return super.close(options);
    }

    // eslint-disable-next-line no-useless-return,consistent-return
    return;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.send-defense').click(e => {
      const {
        combat: {
          fatigue,
          modifier,
          weapon,
          multipleDefensesPenalty,
          at,
          accumulateDefenses,
          weaponUsed
        },
        blindnessPen,
        distance,
        inmaterial
      } = this.modalData.defender;
      this.defenderActor.setFlag('animabf', 'lastDefensiveWeaponUsed', weaponUsed);

      const type = e.currentTarget.dataset.type === 'dodge' ? 'dodge' : 'block';
      let value;
      let baseDefense;
      let unableToDefense = false;
      let combatModifier = blindnessPen;
      const projectileType = this.modalData.attacker.projectile?.type;
      if (e.currentTarget.dataset.type === 'dodge') {
        value = this.defenderActor.system.combat.dodge.final.value;
        baseDefense = this.defenderActor.system.combat.dodge.base.value;
        const maestry = baseDefense >= 200;
        if (
          ((!distance.enable && !distance.check) ||
            (distance.enable && distance.value > 1)) &&
          projectileType == 'shot' &&
          !maestry
        ) {
          combatModifier -= 30;
        }
      } else {
        const attackerSpecialType = this.modalData.attacker.specialType;
        let defenderSpecialType = this.modalData.defender.specialType;
        if (attackerSpecialType == 'inmaterial' && !inmaterial) {
          unableToDefense = true;
        }
        if (
          energyCheck(weapon?.system.critic.primary.value) ||
          energyCheck(weapon?.system.critic.secondary.value)
        ) {
          unableToDefense = false;
        } else if (defenderSpecialType[attackerSpecialType] == false) {
          if (attackerSpecialType == 'energy') {
            combatModifier -= 120;
          } else {
            unableToDefense = true;
          }
        }
        value = weapon
          ? weapon.system.block.final.value
          : this.defenderActor.system.combat.block.final.value;
        baseDefense = this.defenderActor.system.combat.block.base.value;
        const isShield = weapon?.system.isShield.value;
        const maestry = baseDefense >= 200;
        if (!distance.check || (distance.enable && distance.value > 1)) {
          if (projectileType == 'shot') {
            if (!maestry) {
              if (!isShield) {
                combatModifier -= 80;
              } else {
                combatModifier -= 30;
              }
            } else if (!isShield) {
              combatModifier -= 20;
            }
          }
          if (projectileType == 'throw') {
            if (!maestry) {
              if (!isShield) {
                combatModifier -= 50;
              }
            }
          }
        }
      }
      const newModifier = combatModifier + modifier ?? 0;
      let atResValue = 0;
      if (at.defense) {
        atResValue += at.final * 10 + 20;
      }

      let formula = `1d100xa + ${newModifier} + ${fatigue ?? 0} * 15 - ${
        (multipleDefensesPenalty ?? 0) * -1
      } + ${value}`;
      if (this.modalData.defender.withoutRoll) {
        // Remove the dice from the formula
        formula = formula.replace('1d100xa', '0');
      }
      if (baseDefense >= 200) {
        // Mastery reduces the fumble range
        formula = formula.replace('xa', 'xamastery');
      }

      const roll = new ABFFoundryRoll(formula, this.defenderActor.system);

      roll.roll();

      if (this.modalData.defender.showRoll) {
        const { i18n } = game;

        const flavor = i18n.format(`macros.combat.dialog.physicalDefense.${type}.title`, {
          target: this.modalData.attacker.token.name
        });

        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
          flavor
        });
      }

      const rolled =
        roll.total -
        newModifier -
        (fatigue ?? 0) * 15 -
        (multipleDefensesPenalty ?? 0) -
        value;

      this.hooks.onDefense({
        type: 'combat',
        values: {
          type,
          multipleDefensesPenalty,
          modifier: newModifier,
          fatigue,
          at: at.final,
          defense: value,
          roll: rolled,
          total: roll.total,
          unableToDefense,
          atResValue,
          accumulateDefenses
        }
      });

      this.modalData.defenseSent = true;

      this.render();
    });

    html.find('.send-defense-damage-resistance').click(() => {
      const { at } = this.modalData.defender.combat;
      const { surprised } = this.modalData.defender.resistance;
      this.hooks.onDefense({
        type: 'resistance',
        values: {
          at: at.final,
          surprised,
          total: 0
        }
      });

      this.modalData.defenseSent = true;

      this.render();
    });

    html.find('.send-mystic-defense').click(() => {
      const {
        mystic: {
          magicProjection,
          modifier,
          spellUsed,
          spellGrade,
          spellCasting,
          shieldUsed,
          newShield
        },
        combat: { at },
        blindnessPen
      } = this.modalData.defender;
      const { spells, mysticShields } = this.defenderActor.system.mystic;
      let spell,
        supShield = { create: false },
        atResValue = 0;
      if (at.defense) {
        atResValue += at.final * 10 + 20;
      }

      const newModifier = blindnessPen + modifier ?? 0;

      if (!newShield) {
        if (!shieldUsed) {
          return ui.notifications.warn(
            'No tienes escudos místicos activos, has click en Escudo nuevo'
          );
        }
        spell = mysticShields.find(w => w._id === shieldUsed);
        supShield = { ...spell, create: false, id: shieldUsed };
      } else if (spellUsed) {
        this.defenderActor.setFlag(
          'animabf',
          'spellCastingOverride',
          spellCasting.override.value
        );
        this.defenderActor.setFlag('animabf', 'lastDefensiveSpellUsed', spellUsed);
        spell = spells.find(w => w._id === spellUsed);
        spellCasting.zeon.cost = spell?.system.grades[spellGrade].zeon.value;
        let evaluateCastMsj = evaluateCast(spellCasting);
        if (evaluateCastMsj !== undefined) {
          spellCasting.override.ui = true;
          return evaluateCastMsj;
        }
        const spellEffect = shieldValueCheck(
          spell?.system.grades[spellGrade].description.value ?? ''
        );
        supShield = {
          name: spell.name,
          system: {
            grade: { value: spellGrade },
            damageBarrier: { value: 0 },
            shieldPoints: { value: spellEffect[0] }
          },
          create: true
        };
      }

      let formula = `1d100xa + ${magicProjection.final} + ${newModifier}`;
      if (this.modalData.defender.withoutRoll) {
        // Remove the dice from the formula
        formula = formula.replace('1d100xa', '0');
      }
      if (magicProjection.base >= 200) {
        // Mastery reduces the fumble range
        formula = formula.replace('xa', 'xamastery');
      }
      const roll = new ABFFoundryRoll(formula, this.attackerActor.system);
      roll.roll();

      if (this.modalData.defender.showRoll) {
        const { i18n } = game;

        const flavor = i18n.format('macros.combat.dialog.magicDefense.title', {
          spell: spell.name,
          target: this.modalData.attacker.token.name
        });

        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
          flavor
        });
      }

      let unableToDefense = false,
        dobleDamage = false,
        cantDamage = false;
      const attackerSpecialType = this.modalData.attacker.specialType;
      const shieldCheck = shieldSupernaturalCheck(spell.name, attackerSpecialType);
      unableToDefense = shieldCheck[0];
      dobleDamage = shieldCheck[1];
      cantDamage = shieldCheck[2];

      const rolled = roll.total - magicProjection.final - newModifier;

      this.hooks.onDefense({
        type: 'mystic',
        values: {
          modifier: newModifier,
          magicProjection: magicProjection.final,
          spellGrade,
          spellUsed,
          spellName: spell.name,
          at: at.final,
          roll: rolled,
          total: roll.total,
          unableToDefense,
          dobleDamage,
          cantDamage,
          atResValue,
          spellCasting,
          supShield
        }
      });

      this.modalData.defenseSent = true;

      this.render();
    });

    html.find('.send-psychic-defense').click(() => {
      const {
        psychic: { psychicPotential, powerUsed, modifier, shieldUsed, newShield },
        combat: { at },
        blindnessPen,
        inhuman,
        zen
      } = this.modalData.defender;
      const { i18n } = game;
      const { psychicPowers, psychicShields } = this.defenderActor.system.psychic;
      let power,
        fatigueCheck,
        atResValue = 0,
        supShield = { create: false },
        newPsychicPotential;
      if (at.defense) {
        atResValue += at.final * 10 + 20;
      }

      const newModifier = blindnessPen + modifier ?? 0;
      const psychicProjection =
        this.defenderActor.system.psychic.psychicProjection.imbalance.defensive.final
          .value;
      let formula = `1d100xa + ${psychicProjection} + ${newModifier}`;
      if (this.modalData.defender.withoutRoll) {
        // Remove the dice from the formula
        formula = formula.replace('1d100xa', '0');
      }
      if (this.defenderActor.system.psychic.psychicProjection.base.value >= 200) {
        // Mastery reduces the fumble range
        formula = formula.replace('xa', 'xamastery');
      }

      const roll = new ABFFoundryRoll(formula, this.defenderActor.system);
      roll.roll();
      const rolled = roll.total - psychicProjection - newModifier;

      if (!newShield) {
        if (!shieldUsed) {
          return ui.notifications.warn(
            'No tienes escudos psíquicos activos, has click en Escudo nuevo'
          );
        }
        power = psychicShields.find(w => w._id === shieldUsed);
        supShield = { ...power, create: false, id: shieldUsed };
      } else if (powerUsed) {
        this.defenderActor.setFlag('animabf', 'lastDefensivePowerUsed', powerUsed);
        power = psychicPowers.find(w => w._id === powerUsed);
        const psychicPotentialRoll = new ABFFoundryRoll(
          `1d100xa + ${psychicPotential.final}`,
          this.modalData.defender.actor.system
        );
        psychicPotentialRoll.roll();
        newPsychicPotential = psychicPotentialRoll.total;
        let imbalance = psychicImbalanceCheck(this.defenderActor, power) ?? 0;
        const newPotentialBase = psychicPotentialEffect(
          psychicPotential.base,
          0,
          inhuman,
          zen
        );
        const newPotentialTotal = psychicPotentialEffect(
          psychicPotentialRoll.total,
          imbalance,
          inhuman,
          zen
        );
        const baseEffect = shieldBaseValueCheck(newPotentialBase, power?.system.effects);
        const finalEffect = shieldValueCheck(
          power?.system.effects[newPotentialTotal].value ?? ''
        );
        const fatigueInmune = this.defenderActor.system.general.advantages.find(
          i => i.name === 'Res. a la fatiga psíquica'
        );
        fatigueCheck = psychicFatigue(
          power?.system.effects[newPotentialTotal].value,
          fatigueInmune
        );
        const fatiguePen = fatigueCheck[1];
        const overmantained = baseEffect[0] >= finalEffect[0];

        if (fatigueCheck[0]) {
          psychicPotentialRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
            flavor: i18n.format('macros.combat.dialog.psychicPotentialFatigue.title', {
              fatiguePen
            })
          });
          this.defenderActor.applyFatigue(fatiguePen);
        } else {
          supShield = {
            name: power.name,
            system: {
              overmantained,
              damageBarrier: { value: 0 },
              shieldPoints: {
                value: finalEffect[0],
                maintainMax: baseEffect[0]
              }
            },
            create: true
          };
          psychicPotentialRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
            flavor: i18n.format('macros.combat.dialog.psychicPotential.title')
          });
        }
      }

      let unableToDefense = false;
      const attackerSpecialType = this.modalData.attacker.specialType;
      const shieldCheck = shieldSupernaturalCheck(power.name, attackerSpecialType);
      unableToDefense = shieldCheck[0];
      if (
        this.modalData.defender.showRoll &&
        (fatigueCheck == undefined || !fatigueCheck[0])
      ) {
        const flavor = i18n.format('macros.combat.dialog.psychicDefense.title', {
          power: power.name,
          target: this.modalData.attacker.token.name
        });

        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
          flavor
        });
      } else {
        unableToDefense = true;
      }

      this.hooks.onDefense({
        type: 'psychic',
        values: {
          modifier: newModifier,
          powerUsed,
          psychicProjection,
          psychicPotential: newPsychicPotential ?? 0,
          at: at.final,
          roll: rolled,
          total: roll.total,
          unableToDefense,
          dobleDamage: false,
          cantDamage: false,
          atResValue,
          supShield
        }
      });

      this.modalData.defenseSent = true;

      this.render();
    });
  }

  getData() {
    const {
      defender: { combat, psychic, mystic },
      ui
    } = this.modalData;
    ui.hasFatiguePoints =
      this.defenderActor.system.characteristics.secondaries.fatigue.value > 0;

    const { psychicPowers } = this.defenderActor.system.psychic;
    if (!psychic.powerUsed) {
      psychic.powerUsed = psychicPowers.filter(
        w => w.system.combatType.value === 'defense'
      )[0]?._id;
    }
    const power = psychicPowers.find(w => w._id === psychic.powerUsed);
    let psychicBonus = power?.system.bonus.value ?? 0;
    psychic.psychicPotential.final =
      psychic.psychicPotential.special +
      this.defenderActor.system.psychic.psychicPotential.final.value +
      psychicBonus;

    const { psychicShields } = this.defenderActor.system.psychic;
    if (!psychic.shieldUsed) {
      psychic.shieldUsed = psychicShields.filter(
        w => w.system.shieldPoints?.value > 0
      )[0];
    }
    const psychicShield = psychicShields.find(w => w._id === psychic.shieldUsed);
    psychic.shieldValue = psychicShield?.system.shieldPoints?.value ?? 0;

    const { spells } = this.defenderActor.system.mystic;
    if (!mystic.spellUsed) {
      mystic.spellUsed = spells.filter(
        w => w.system.combatType.value === 'attack'
      )[0]?._id;
    }
    const spell = spells.find(w => w._id === mystic.spellUsed);
    const mysticSpellCheck = mysticSpellCastEvaluate(
      this.defenderActor,
      spell,
      mystic.spellGrade
    );
    mystic.spellCasting.spell = mysticSpellCheck;
    if (!mystic.spellCasting.spell.innate) {
      mystic.spellCasting.cast.innate = false;
    }
    if (!mystic.spellCasting.spell.prepared) {
      mystic.spellCasting.cast.prepared = false;
    }

    const { mysticShields } = this.defenderActor.system.mystic;
    if (!mystic.shieldUsed) {
      mystic.shieldUsed = mysticShields.filter(w => w.system.shieldPoints?.value > 0)[0];
    }
    const mysticShield = mysticShields.find(w => w._id === mystic.shieldUsed);
    mystic.shieldValue = mysticShield?.system.shieldPoints?.value ?? 0;

    const { weapons } = this.defenderActor.system.combat;
    combat.weapon = weapons.find(w => w._id === combat.weaponUsed);

    return this.modalData;
  }

  async _updateObject(event, formData) {
    this.modalData = mergeObject(this.modalData, formData);

    this.render();
  }
}
