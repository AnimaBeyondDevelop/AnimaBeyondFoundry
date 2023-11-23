import { Templates } from '../../utils/constants';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { mysticCanCastEvaluate } from '../../combat/utils/mysticCanCastEvaluate.js';
import { evaluateCast } from '../../combat/utils/evaluateCast.js';
import { psychicFatigue } from '../../combat/utils/psychicFatigue.js';
import { psychicImbalanceCheck } from '../../combat/utils/psychicImbalanceCheck.js';
import { psychicPotentialEffect } from '../../combat/utils/psychicPotentialEffect.js';
import { shieldBaseValueCheck } from '../../combat/utils/shieldBaseValueCheck.js';
import { shieldValueCheck } from '../../combat/utils/shieldValueCheck.js';
import { shieldSupernaturalCheck } from '../../combat/utils/shieldSupernaturalCheck.js';
import { getFinalArmor } from '../../combat/utils/getFinalArmor.js';
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
      specialType: attacker.specialType,
      specificAttack: attacker.specificAttack,
      reducedArmor: attacker.reducedArmor,
    },
    defender: {
      token: defender,
      actor: defenderActor,
      showRoll: !isGM || showRollByDefault,
      withoutRoll: defenderActor.system.general.settings.defenseType.value === 'mass',
      lifePoints: defenderActor.system.characteristics.secondaries.lifePoints.value,
      blindnessPen: 0,
      distance: attacker.distance,
      specificAttack: { characteristic: undefined },
      specialType: {
        material: true,
        inmaterial: false,
        intangible: false,
        energy: false,
        materialEnergy: true,
        attackSpellLight: false,
        attackSpellDarkness: false
      },
      zen: defenderActor.system.general.settings.zen.value,
      inhuman: defenderActor.system.general.settings.inhuman.value,
      inmaterial: defenderActor.system.general.settings.inmaterial.value,
      combat: {
        fatigueUsed: 0,
        multipleDefensesPenalty: defensesCounterCheck(defensesCounter.accumulated),
        accumulateDefenses: defensesCounter.keepAccumulating,
        modifier: 0,
        weaponUsed: undefined,
        weapon: undefined,
        unarmed: false,
        at: {
          special: 0,
          final: 0
        },
        supernaturalShield: {
          shieldUsed: undefined,
          shieldValue: 0,
          newShield: true
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
          canCast: { prepared: false, innate: false },
          casted: { prepared: false, innate: false },
          override: { value: false, ui: false }
        },
        supernaturalShield: {
          shieldUsed: undefined,
          shieldValue: 0,
          newShield: true
        }
      },
      psychic: {
        modifier: 0,
        psychicPotential: {
          special: 0,
          base: defenderActor.system.psychic.psychicPotential.base.value,
          final: defenderActor.system.psychic.psychicPotential.final.value
        },
        psychicProjection: {
          base: defenderActor.system.psychic.psychicProjection.imbalance.defensive.base
            .value,
          final:
            defenderActor.system.psychic.psychicProjection.imbalance.defensive.final.value
        },
        powerUsed: undefined,
        supernaturalShield: {
          shieldUsed: undefined,
          shieldValue: 0,
          newShield: true
        }
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
    const defensesCounter = this.defenderActor.getFlag(
      'world',
      `${this.defenderActor._id}.defensesCounter`
    ) || { value: true, accumulated: 0 };
    this.modalData.defender.combat.accumulateDefenses = defensesCounter.value;
    this.modalData.defender.combat.multipleDefensesPenalty = defensesCounterCheck(
      defensesCounter.accumulated
    );
    this.modalData.defender.specificAttack.characteristic = Math.max(
      this.defenderActor.system.characteristics.primaries.strength.value,
      this.defenderActor.system.characteristics.primaries.agility.value
    );
    this.modalData.defender.zen = this.defenderActor.system.general.settings.zen.value;
    this.modalData.defender.inhuman =
      this.defenderActor.system.general.settings.inhuman.value;
    this.modalData.defender.inmaterial =
      this.defenderActor.system.general.settings.inmaterial.value;
    if (
      (this.modalData.attacker.critic !== NoneWeaponCritic.NONE &&
        this.modalData.attacker.damage == 0) ||
      this.modalData.attacker.specificAttack.check
    ) {
      this.modalData.defender.combat.at.defense = true;
    }

    const { psychic, mystic, combat } = this.modalData.defender;
    const { weapons, supernaturalShields } = this.defenderActor.system.combat;
    const { spells } = this.defenderActor.system.mystic;
    const { psychicPowers } = this.defenderActor.system.psychic;

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
      const canCast = mysticCanCastEvaluate(this.defenderActor, spell, mystic.spellGrade);
      mystic.spellCasting.canCast = canCast;
      const spellCastingOverride = this.defenderActor.getFlag(
        'animabf',
        'spellCastingOverride'
      );
      mystic.spellCasting.override.value = spellCastingOverride || false;
      mystic.spellCasting.override.ui = spellCastingOverride || false;
    }

    if (supernaturalShields.length > 0) {
      const mysticShield = supernaturalShields.find(
        w => w.system.type === 'mystic' && w.system.origin === this.defenderActor.uuid
      );
      if (mysticShield) {
        mystic.supernaturalShield = {
          shieldUsed: mysticShield?._id,
          shieldValue: mysticShield?.system.shieldPoints,
          newShield: false
        };
      }

      const psychicShield = supernaturalShields.find(
        w => w.system.type === 'psychic' && w.system.origin === this.defenderActor.uuid
      );
      if (psychicShield) {
        psychic.supernaturalShield = {
          shieldUsed: psychicShield?._id,
          shieldValue: psychicShield?.system.shieldPoints,
          newShield: false
        };
      }
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
          fatigueUsed,
          modifier,
          weapon,
          multipleDefensesPenalty,
          at,
          accumulateDefenses,
          weaponUsed
        },
        lifePoints,
        blindnessPen,
        distance,
        inmaterial,
        specificAttack
      } = this.modalData.defender;
      this.defenderActor.setFlag('animabf', 'lastDefensiveWeaponUsed', weaponUsed);

      const type = e.currentTarget.dataset.type === 'dodge' ? 'dodge' : 'block';
      let value;
      let baseDefense;
      const defenderCombatMod = {
        modifier: { value: modifier, apply: true },
        blindnessPen: { value: blindnessPen, apply: true },
        fatigueUsed: { value: fatigueUsed * 15, apply: true },
        multipleDefensesPenalty: {
          value: multipleDefensesPenalty,
          apply: true
        }
      };
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
          defenderCombatMod.dodgeProjectile = {
            value: -30,
            apply: true
          };
        }
      } else {
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
                defenderCombatMod.parryProjectile = {
                  value: -80,
                  apply: true
                };
              } else {
                defenderCombatMod.shieldParryProjectile = {
                  value: -30,
                  apply: true
                };
              }
            } else if (!isShield) {
              defenderCombatMod.maestryParryProjectile = {
                value: -20,
                apply: true
              };
            }
          }
          if (projectileType == 'throw') {
            if (!maestry) {
              if (!isShield) {
                defenderCombatMod.parryThrow = {
                  value: -50,
                  apply: true
                };
              }
            }
          }
        }
      }
      const newModifier = combatModifier + modifier ?? 0;

      at.final = getFinalArmor(this.defenderActor, at.final, this.modalData.attacker.reducedArmor);

      let atResValue = 0;
      if (at.defense) {
        atResValue += at.final * 10 + 20;
      }

      let combatModifier = 0;
      for (const key in defenderCombatMod) {
        combatModifier += defenderCombatMod[key]?.value ?? 0;
      }
      let formula = `1d100xa + ${combatModifier} + ${value}`;
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

      const reducedDamage = this.defenderActor.system.combat.incomingDamageReduction.value;

      const rolled = roll.total - combatModifier - value;

      this.hooks.onDefense({
        type: 'combat',
        values: {
          type,
          modifier: combatModifier,
          fatigueUsed,
          at: at.final,
          defense: value,
          roll: rolled,
          total: roll.total,
          unableToDefense,
          atResValue,
          accumulateDefenses,
          specificAttack,
          lifePoints,
          reducedDamage,
          defenderCombatMod
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

    html.find('.send-mystic-defense').click(async () => {
      const {
        mystic: {
          magicProjection,
          modifier,
          spellUsed,
          spellGrade,
          spellCasting,
          supernaturalShield: { shieldUsed, newShield }
        },
        combat: { at },
        lifePoints,
        blindnessPen,
        specificAttack
      } = this.modalData.defender;
      const { i18n } = game;
      const { spells } = this.defenderActor.system.mystic;
      const { supernaturalShields } = this.defenderActor.system.combat;
      let spell,
        supShield = { create: false };
      const defenderCombatMod = {
        modifier: { value: modifier, apply: true },
        blindnessPen: { value: blindnessPen, apply: true }
      };

      if (!newShield) {
        if (!shieldUsed) {
          return ui.notifications.warn(
            i18n.localize('macros.combat.dialog.warning.supernaturalShield.mystic')
          );
        }
        spell = supernaturalShields.find(w => w._id === shieldUsed);
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
        const supernaturalShieldData =
          await this.modalData.defender.actor.supernaturalShieldData(
            'mystic',
            {},
            0,
            spell,
            spellGrade
          );
        supShield = { ...supernaturalShieldData, create: true };
      }

      let combatModifier = 0;
      for (const key in defenderCombatMod) {
        combatModifier += defenderCombatMod[key]?.value ?? 0;
      }
      let formula = `1d100xa + ${magicProjection.final} + ${combatModifier}`;
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
        const flavor = i18n.format('macros.combat.dialog.magicDefense.title', {
          spell: spell.name,
          target: this.modalData.attacker.token.name
        });

        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
          flavor
        });
      }

      const rolled = roll.total - magicProjection.final - combatModifier;

      this.hooks.onDefense({
        type: 'mystic',
        values: {
          modifier: combatModifier,
          magicProjection: magicProjection.final,
          spellGrade,
          spellUsed,
          spellName: spell.name,
          at: at.final,
          roll: rolled,
          total: roll.total,
          spellCasting,
          supShield,
          specificAttack,
          lifePoints,
          defenderCombatMod
        }
      });

      this.modalData.defenseSent = true;

      this.render();
    });

    html.find('.send-psychic-defense').click(async () => {
      const {
        psychic: {
          psychicPotential,
          powerUsed,
          modifier,
          supernaturalShield: { shieldUsed, newShield }
        },
        combat: { at },
        blindnessPen
      } = this.modalData.defender;
      const { i18n } = game;
      const { psychicPowers } = this.defenderActor.system.psychic;
      const { supernaturalShields } = this.defenderActor.system.combat;
      let power,
        fatigue,
        supShield = { create: false },
        newPsychicPotential;

      const defenderCombatMod = {
        modifier: { value: modifier, apply: true },
        blindnessPen: { value: blindnessPen, apply: true }
      };
      const psychicProjection =
        this.defenderActor.system.psychic.psychicProjection.imbalance.defensive.final
          .value;
      let combatModifier = 0;
      for (const key in defenderCombatMod) {
        combatModifier += defenderCombatMod[key]?.value ?? 0;
      }
      let formula = `1d100xa + ${psychicProjection} + ${combatModifier}`;
      if (this.modalData.defender.withoutRoll) {
        // Remove the dice from the formula
        formula = formula.replace('1d100xa', '0');
      }
      if (psychicProjection.base >= 200) {
        // Mastery reduces the fumble range
        formula = formula.replace('xa', 'xamastery');
      }

      const psychicProjectionRoll = new ABFFoundryRoll(
        formula,
        this.defenderActor.system
      );
      psychicProjectionRoll.roll();
      const rolled = psychicProjectionRoll.total - psychicProjection - combatModifier;

      if (!newShield) {
        if (!shieldUsed) {
          return ui.notifications.warn(
            i18n.localize('macros.combat.dialog.warning.supernaturalShield.psychic')
          );
        }
        power = supernaturalShields.find(w => w._id === shieldUsed);
        supShield = { ...power, create: false, id: shieldUsed };
      } else if (powerUsed) {
        this.defenderActor.setFlag('animabf', 'lastDefensivePowerUsed', powerUsed);
        power = psychicPowers.find(w => w._id === powerUsed);
        const psychicPotentialRoll = new ABFFoundryRoll(
          `1d100PsychicRoll + ${psychicPotential.final}`,
          { ...this.defenderActor.system, power }
        );
        psychicPotentialRoll.roll();
        newPsychicPotential = psychicPotentialRoll.total;
        if (this.modalData.defender.showRoll) {
          psychicPotentialRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
            flavor: i18n.format('macros.combat.dialog.psychicPotential.title')
          });
        }

        fatigue = await this.defenderActor.evaluatePsychicFatigue(
          power,
          psychicPotentialRoll.total,
          this.modalData.attacker.showRoll
        );

        if (!fatigue) {
          const supernaturalShieldData =
            await this.modalData.defender.actor.supernaturalShieldData(
              'psychic',
              power,
              psychicPotentialRoll.total
            );
          supShield = { ...supernaturalShieldData, create: true };
        }
      }

      if (!fatigue) {
        if (this.modalData.defender.showRoll) {
          const flavor = i18n.format('macros.combat.dialog.psychicDefense.title', {
            power: power.name,
            target: this.modalData.attacker.token.name
          });

          psychicProjectionRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
            flavor
          });
        }
      }

      this.hooks.onDefense({
        type: 'psychic',
        values: {
          modifier: combatModifier,
          powerUsed,
          psychicProjection: psychicProjection.final,
          psychicPotential: newPsychicPotential ?? 0,
          at: at.final,
          roll: rolled,
          unableToDefense,
          dobleDamage: false,
          cantDamage: false,
          atResValue,
          specificAttack,
          lifePoints,
          total: psychicProjectionRoll.total,
          fatigue,
          supShield,
          defenderCombatMod
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
      psychic.powerUsed = psychicPowers.find(
        w => w.system.combatType.value === 'defense'
      )?._id;
    }
    const power = psychicPowers.find(w => w._id === psychic.powerUsed);
    let psychicBonus = power?.system.bonus.value ?? 0;
    psychic.psychicPotential.final =
      psychic.psychicPotential.special +
      this.defenderActor.system.psychic.psychicPotential.final.value +
      psychicBonus;

    const { spells } = this.defenderActor.system.mystic;
    if (!mystic.spellUsed) {
      mystic.spellUsed = spells.find(w => w.system.combatType.value === 'attack')?._id;
    }
    const spell = spells.find(w => w._id === mystic.spellUsed);
    const canCast = mysticCanCastEvaluate(this.defenderActor, spell, mystic.spellGrade);
    mystic.spellCasting.canCast = canCast;
    if (!mystic.spellCasting.canCast.innate) {
      mystic.spellCasting.casted.innate = false;
    }
    if (!mystic.spellCasting.canCast.prepared) {
      mystic.spellCasting.casted.prepared = false;
    }

    const { supernaturalShields } = this.defenderActor.system.combat;
    if (!mystic.supernaturalShield.shieldUsed) {
      mystic.supernaturalShield.shieldUsed = supernaturalShields.find(
        w => w.system.type === 'mystic' && w.system.origin === this.defenderActor.uuid
      );
    }
    const mysticShield = supernaturalShields.find(
      w => w._id === mystic.supernaturalShield.shieldUsed
    );
    mystic.supernaturalShield.shieldValue = mysticShield?.system.shieldPoints ?? 0;

    if (!psychic.supernaturalShield.shieldUsed) {
      psychic.supernaturalShield.shieldUsed = supernaturalShields.find(
        w => w.system.type === 'psychic' && w.system.origin === this.defenderActor.uuid
      );
    }
    const psychicShield = supernaturalShields.find(
      w => w._id === psychic.supernaturalShield.shieldUsed
    );
    psychic.supernaturalShield.shieldValue = psychicShield?.system.shieldPoints ?? 0;

    const { weapons } = this.defenderActor.system.combat;
    combat.weapon = weapons.find(w => w._id === combat.weaponUsed);

    return this.modalData;
  }

  async _updateObject(event, formData) {
    this.modalData = mergeObject(this.modalData, formData);

    this.render();
  }
}
