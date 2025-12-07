import { Templates } from '../../utils/constants';
import { resistanceEffectCheck } from '../../combat/utils/resistanceEffectCheck.js';
import { damageCheck } from '../../combat/utils/damageCheck.js';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { ABFConfig } from '../../ABFConfig';

const getInitialData = (attacker, defender, options = {}) => {
  const combatDistance = !!game.settings.get(
    game.animabf.id,
    ABFSettingsKeys.AUTOMATE_COMBAT_DISTANCE
  );
  const showRollByDefault = !!game.settings.get(
    game.animabf.id,
    ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
  );
  const isGM = !!game.user?.isGM;

  const attackerActor = attacker.actor;
  const defenderActor = defender.actor;

  return {
    ui: {
      isGM,
      hasFatiguePoints:
        attackerActor.system.characteristics.secondaries.fatigue.value > 0,
      weaponHasSecondaryCritic: undefined
    },
    attacker: {
      token: attacker,
      actor: attackerActor,
      showRoll: !isGM || showRollByDefault,
      withoutRoll: false,
      poorVisibility: false,
      targetInCover: false,
      counterAttackBonus: options.counterAttackBonus,
      zen: attackerActor.system.general.settings.zen.value,
      inhuman: attackerActor.system.general.settings.inhuman.value,
      inmaterial: attackerActor.system.general.settings.inmaterial.value,
      distance: {
        value: 0,
        enable: combatDistance,
        check: false
      },
      combat: {
        fatigueUsed: 0,
        modifier: 0,
        unarmed: false,
        weaponUsed: undefined,
        criticSelected: undefined,
        weapon: undefined,
        resistanceEffect: { value: 0, type: undefined, check: false },
        visible: true,
        highGround: false,
        distanceCheck: false,
        projectile: {
          value: false,
          type: ''
        },
        damage: {
          special: 0,
          final: 0
        }
      },
      mystic: {
        modifier: 0,
        magicProjection: {
          base: attackerActor.system.mystic.magicProjection.imbalance.offensive.base
            .value,
          final:
            attackerActor.system.mystic.magicProjection.imbalance.offensive.final.value
        },
        spellUsed: undefined,
        spellGrade: 'base',
        attainableSpellGrades: [],
        spellCasting: {
          zeon: { accumulated: 0, cost: 0 },
          canCast: { prepared: false, innate: false },
          casted: { prepared: false, innate: false },
          override: false
        },
        overrideMysticCast: false,
        critic: game.animabf.weapon.NoneWeaponCritic.NONE,
        resistanceEffect: { value: 0, type: undefined, check: false },
        visible: false,
        distanceCheck: false,
        projectile: {
          value: true,
          type: 'shot'
        },
        damage: {
          special: 0,
          final: 0
        }
      },
      psychic: {
        modifier: 0,
        psychicProjection:
          attackerActor.system.psychic.psychicProjection.imbalance.offensive.final.value,
        psychicPotential: {
          special: 0,
          final: attackerActor.system.psychic.psychicPotential.final.value
        },
        powerUsed: undefined,
        critic: game.animabf.weapon.NoneWeaponCritic.NONE,
        eliminateFatigue: false,
        mentalPatternImbalance: false,
        resistanceEffect: { value: 0, type: undefined, check: false },
        visible: false,
        distanceCheck: false,
        projectile: {
          value: true,
          type: 'shot'
        },
        damageModifier: 0
      }
    },
    defender: {
      token: defender,
      actor: defenderActor,
      inmaterial: defenderActor.system.general.settings.inmaterial.value
    },
    attackSent: false,
    allowed: false,
    config: ABFConfig
  };
};

export class CombatAttackDialog extends FormApplication {
  constructor(attacker, defender, hooks, options = {}) {
    super(getInitialData(attacker, defender, options));

    this.modalData = getInitialData(attacker, defender, options);

    const { combat, psychic, mystic } = this.modalData.attacker;

    if (this.modalData.attacker.distance.enable) {
      const calculateDistance =
        canvas.grid.measureDistance(
          this.modalData.attacker.token,
          this.modalData.defender.token,
          { gridSpaces: true }
        ) / canvas.dimensions.distance;
      this.modalData.attacker.distance.value = calculateDistance;
    }

    const { weapons } = this.attackerActor.system.combat;
    const { spells, mysticSettings } = this.attackerActor.system.mystic;
    const { psychicPowers } = this.attackerActor.system.psychic;

    if (psychicPowers.length > 0) {
      const lastOffensivePowerUsed = this.attackerActor.getFlag(
        game.animabf.id,
        'lastOffensivePowerUsed'
      );
      if (psychicPowers.find(w => w._id === lastOffensivePowerUsed)) {
        psychic.powerUsed = lastOffensivePowerUsed;
      } else {
        psychic.powerUsed = psychicPowers.find(
          w => w.system.combatType.value === 'attack'
        )?._id;
      }
      const power = psychicPowers.find(w => w._id === psychic.powerUsed);
      psychic.critic =
        power?.system.critic.value ?? game.animabf.weapon.NoneWeaponCritic.NONE;
    }

    if (spells.length > 0) {
      const lastOffensiveSpellUsed = this.attackerActor.getFlag(
        game.animabf.id,
        'lastOffensiveSpellUsed'
      );
      if (spells.find(w => w._id === lastOffensiveSpellUsed)) {
        mystic.spellUsed = lastOffensiveSpellUsed;
      } else {
        mystic.spellUsed = spells.find(w => w.system.combatType.value === 'attack')?._id;
      }
      const spellCastingOverride = this.attackerActor.getFlag(
        game.animabf.id,
        'spellCastingOverride'
      );
      mystic.spellCasting.override = spellCastingOverride || false;
      mystic.overrideMysticCast = spellCastingOverride || false;
      const spell = spells.find(w => w._id === mystic.spellUsed);
      mystic.critic =
        spell?.system.critic.value ?? game.animabf.weapon.NoneWeaponCritic.NONE;
      if (this.modalData.attacker.mystic.spellCasting.override) {
        this.modalData.attacker.mystic.attainableSpellGrades = [
          'base',
          'intermediate',
          'advanced',
          'arcane'
        ];
      } else {
        const intelligence =
          this.attackerActor.system.characteristics.primaries.intelligence.value;
        const finalIntelligence = mysticSettings.aptitudeForMagicDevelopment
          ? intelligence + 3
          : intelligence;
        for (const grade in spell?.system.grades) {
          if (finalIntelligence >= spell?.system.grades[grade].intRequired.value) {
            mystic.attainableSpellGrades.push(grade);
          }
        }
      }
    }

    if (weapons.length > 0) {
      const lastOffensiveWeaponUsed = this.attackerActor.getFlag(
        game.animabf.id,
        'lastOffensiveWeaponUsed'
      );
      if (weapons.find(weapon => weapon._id == lastOffensiveWeaponUsed)) {
        combat.weaponUsed = lastOffensiveWeaponUsed;
      } else {
        combat.weaponUsed = weapons[0]._id;
      }
    } else {
      combat.unarmed = true;
    }

    this.modalData.allowed = game.user?.isGM || (options.allowed ?? false);

    this.hooks = hooks;

    this.render(true);
  }

  // Helper: get base dice formula from actor settings
  getBaseCombatDiceFormula(actor) {
    const diceSettings = actor.system.general.diceSettings;
    return diceSettings?.abilityDie.value ?? '1d100xa';
  }

  // Helper: remove first dice term when rolling "withoutRoll"
  removeFirstDiceTerm(formula) {
    // Replace everything hasta el primer '+' por '0'
    return formula.replace(/^[^+]+/, '0');
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['animabf-dialog combat-attack-dialog no-close'],
      submitOnChange: true,
      closeOnSubmit: false,
      width: null,
      height: null,
      resizable: true,
      template: Templates.Dialog.Combat.CombatAttackDialog.main,
      title: game.i18n.localize('macros.combat.dialog.modal.attack.title'),
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

  updatePermissions(allowed) {
    this.modalData.allowed = allowed;

    this.render();
  }

  async close(options) {
    if (options?.force) {
      return super.close(options);
    }

    return;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.send-attack').click(async () => {
      const {
        combat: {
          weapon,
          criticSelected,
          modifier,
          fatigueUsed,
          damage,
          weaponUsed,
          unarmed,
          visible,
          distanceCheck
        },
        distance,
        highGround,
        poorVisibility,
        targetInCover
      } = this.modalData.attacker;

      distance.check = distanceCheck;
      this.attackerActor.setFlag(game.animabf.id, 'lastOffensiveWeaponUsed', weaponUsed);

      if (typeof damage !== 'undefined') {
        const attackerCombatMod = {
          modifier: { value: modifier, apply: true },
          fatigueUsed: { value: fatigueUsed * 15, apply: true }
        };

        let projectile = { value: false, type: '' };

        if (weapon?.system.isRanged.value) {
          projectile = {
            value: true,
            type: weapon.system.shotType.value
          };
          if (weapon.system.shotType.value === 'shot') {
            projectile.name = weapon.system.ammo?.name;
          }
          if (
            (!distance.enable && distance.check) ||
            (distance.enable && distance.value <= 1)
          ) {
            attackerCombatMod.pointBlank = { value: 30, apply: true };
          }
          if (highGround) attackerCombatMod.highGround = { value: 20, apply: true };
          if (poorVisibility)
            attackerCombatMod.poorVisibility = { value: -20, apply: true };
          if (targetInCover)
            attackerCombatMod.targetInCover = { value: -40, apply: true };
        }

        if (
          weapon !== undefined &&
          criticSelected !== game.animabf.weapon.NoneWeaponCritic.NONE &&
          criticSelected == weapon?.system.critic.secondary.value
        ) {
          attackerCombatMod.secondaryCritic = { value: -10, apply: true };
        }

        const attack = weapon
          ? weapon.system.attack.final.value
          : this.attackerActor.system.combat.attack.final.value;

        const counterAttackBonus = this.modalData.attacker.counterAttackBonus ?? 0;
        let combatModifier = 0;
        for (const key in attackerCombatMod)
          combatModifier += attackerCombatMod[key]?.value ?? 0;

        const baseDice = this.getBaseCombatDiceFormula(this.attackerActor);
        let formula = `${baseDice} + ${counterAttackBonus} + ${attack} + ${combatModifier}`;

        if (this.modalData.attacker.withoutRoll) {
          formula = this.removeFirstDiceTerm(formula);
        }

        if (this.attackerActor.system.combat.attack.base.value >= 200) {
          formula = formula.replace('xa', 'xamastery');
        }

        const roll = new ABFFoundryRoll(formula, this.attackerActor.system);
        await roll.roll();

        if (this.modalData.attacker.showRoll) {
          const { i18n } = game;
          const flavor = weapon
            ? i18n.format('macros.combat.dialog.physicalAttack.title', {
                weapon: weapon?.name,
                target: this.modalData.defender.token.name
              })
            : i18n.format('macros.combat.dialog.physicalAttack.unarmed.title', {
                target: this.modalData.defender.token.name
              });

          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
            flavor
          });
        }

        // New fields
        const reducedArmorFinal = weapon?.system?.reducedArmor?.final?.value ?? 0;
        const weaponName =
          weapon?.name ?? game.i18n.localize('macros.combat.unarmed') ?? 'Unarmed';

        const critic = criticSelected ?? game.animabf.weapon.WeaponCritic.IMPACT;

        let resistanceEffect = { value: 0, type: undefined, check: false };
        if (weapon) {
          resistanceEffect = resistanceEffectCheck(weapon.system.special.value);
        }

        const rolled = roll.total - counterAttackBonus - attack - (combatModifier ?? 0);

        this.hooks.onAttack({
          type: 'combat',
          values: {
            unarmed,
            damage: damage.final,
            attack,
            weaponUsed,
            reducedArmorFinal,
            weaponName,
            weapon,
            critic,
            modifier: combatModifier,
            fatigueUsed,
            roll: rolled,
            total: roll.total,
            fumble: roll.fumbled,
            resistanceEffect,
            visible,
            distance,
            projectile,
            attackerCombatMod
          }
        });

        this.modalData.attackSent = true;
        this.render();
      }
    });

    html.find('.send-mystic-attack').click(async () => {
      const {
        mystic: {
          magicProjection,
          spellUsed,
          spellGrade,
          spellCasting,
          modifier,
          critic,
          damage,
          projectile,
          distanceCheck
        },
        distance
      } = this.modalData.attacker;
      distance.check = distanceCheck;
      if (spellUsed) {
        const attackerCombatMod = {
          modifier: { value: modifier, apply: true }
        };
        this.attackerActor.setFlag(
          game.animabf.id,
          'spellCastingOverride',
          spellCasting.override
        );
        this.attackerActor.setFlag(game.animabf.id, 'lastOffensiveSpellUsed', spellUsed);
        const { spells } = this.attackerActor.system.mystic;
        const spell = spells.find(w => w._id === spellUsed);
        const spellUsedEffect = spell?.system.grades[spellGrade].description.value ?? '';
        if (this.attackerActor.evaluateCast(spellCasting)) {
          this.modalData.attacker.mystic.overrideMysticCast = true;
          return;
        }
        let visibleCheck = spell?.system.visible;

        let resistanceEffect = resistanceEffectCheck(spellUsedEffect);

        let combatModifier = 0;
        for (const key in attackerCombatMod) {
          combatModifier += attackerCombatMod[key]?.value ?? 0;
        }
        let formula = `1d100xa + ${magicProjection.final} + ${combatModifier ?? 0}`;
        if (this.modalData.attacker.withoutRoll) {
          formula = formula.replace('1d100xa', '0');
        }
        if (magicProjection.base >= 200) {
          formula = formula.replace('xa', 'xamastery');
        }

        const roll = new ABFFoundryRoll(formula, this.attackerActor.system);
        await roll.roll();

        if (this.modalData.attacker.showRoll) {
          const { i18n } = game;

          const flavor = i18n.format('macros.combat.dialog.magicAttack.title', {
            spell: spell.name,
            target: this.modalData.defender.token.name
          });

          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
            flavor
          });
        }

        const rolled = roll.total - magicProjection.final - (combatModifier ?? 0);

        this.hooks.onAttack({
          type: 'mystic',
          values: {
            modifier: combatModifier,
            spellUsed,
            spellGrade,
            spellName: spell.name,
            magicProjection: magicProjection.final,
            critic,
            damage: damage.final,
            reducedArmorFinal: 0,
            roll: rolled,
            total: roll.total,
            fumble: roll.fumbled,
            resistanceEffect,
            visible: visibleCheck,
            distance,
            projectile,
            spellCasting,
            macro: spell.macro,
            attackerCombatMod
          }
        });

        this.modalData.attackSent = true;

        this.render();
      }
    });

    html.find('.send-psychic-attack').click(async () => {
      const {
        psychic: {
          powerUsed,
          modifier,
          psychicPotential,
          psychicProjection,
          critic,
          eliminateFatigue,
          damageModifier,
          mentalPatternImbalance,
          projectile,
          distanceCheck
        },
        distance
      } = this.modalData.attacker;
      distance.check = distanceCheck;
      const { i18n } = game;
      if (powerUsed) {
        const attackerCombatMod = {
          modifier: { value: modifier, apply: true }
        };
        const { psychicPowers } = this.attackerActor.system.psychic;
        const power = psychicPowers.find(w => w._id === powerUsed);
        this.attackerActor.setFlag(game.animabf.id, 'lastOffensivePowerUsed', powerUsed);
        let combatModifier = 0;
        for (const key in attackerCombatMod) {
          combatModifier += attackerCombatMod[key]?.value ?? 0;
        }
        let formula = `1d100xa + ${psychicProjection} + ${combatModifier ?? 0}`;
        if (this.modalData.attacker.withoutRoll) {
          formula = formula.replace('1d100xa', '0');
        }
        if (this.attackerActor.system.psychic.psychicProjection.base.value >= 200) {
          formula = formula.replace('xa', 'xamastery');
        }

        const psychicProjectionRoll = new ABFFoundryRoll(
          formula,
          this.attackerActor.system
        );
        await psychicProjectionRoll.roll();

        const psychicPotentialRoll = new ABFFoundryRoll(
          `1d100PsychicRoll + ${psychicPotential.final}`,
          { ...this.attackerActor.system, power, mentalPatternImbalance }
        );
        await psychicPotentialRoll.roll();
        if (this.modalData.attacker.showRoll) {
          psychicPotentialRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
            flavor: i18n.format('macros.combat.dialog.psychicPotential.title')
          });
        }

        const psychicFatigue = await this.attackerActor.evaluatePsychicFatigue(
          power,
          psychicPotentialRoll.total,
          eliminateFatigue,
          this.modalData.attacker.showRoll
        );

        if (this.modalData.attacker.showRoll) {
          if (!psychicFatigue) {
            const projectionFlavor = i18n.format(
              'macros.combat.dialog.psychicAttack.title',
              {
                power: power.name,
                target: this.modalData.defender.token.name,
                potential: psychicPotentialRoll.total
              }
            );
            psychicProjectionRoll.toMessage({
              speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
              flavor: projectionFlavor
            });
          }
        }

        const powerUsedEffect = power?.system.effects[psychicPotentialRoll.total].value;
        let damage = damageCheck(powerUsedEffect) + damageModifier;
        let resistanceEffect = resistanceEffectCheck(powerUsedEffect);
        let visibleCheck = power?.system.visible;

        const rolled =
          psychicProjectionRoll.total - psychicProjection - (combatModifier ?? 0);
        this.hooks.onAttack({
          type: 'psychic',
          values: {
            modifier: combatModifier,
            powerUsed,
            powerName: power.name,
            psychicPotential: psychicPotentialRoll.total,
            psychicProjection,
            critic,
            damage,
            reducedArmorFinal: 0,
            roll: psychicFatigue ? 0 : rolled,
            total: psychicFatigue ? 0 : psychicProjectionRoll.total,
            fumble: psychicFatigue ? false : psychicProjectionRoll.fumbled,
            resistanceEffect,
            visible: visibleCheck,
            distance,
            projectile,
            macro: power.macro,
            attackerCombatMod
          }
        });

        this.modalData.attackSent = true;

        this.render();
      }
    });
  }

  getData() {
    const {
      attacker: { combat, psychic, mystic },
      ui
    } = this.modalData;

    ui.hasFatiguePoints =
      this.attackerActor.system.characteristics.secondaries.fatigue.value > 0;

    const { psychicPowers } = this.attackerActor.system.psychic;
    if (!psychic.powerUsed) {
      psychic.powerUsed = psychicPowers.find(
        w => w.system.combatType.value === 'attack'
      )?._id;
    }
    const power = psychicPowers.find(w => w._id === psychic.powerUsed);
    let psychicBonus = power?.system.bonus.value ?? 0;
    psychic.psychicPotential.final =
      psychic.psychicPotential.special +
      this.attackerActor.system.psychic.psychicPotential.final.value +
      psychicBonus;

    const { spells } = this.attackerActor.system.mystic;
    if (!mystic.spellUsed) {
      mystic.spellUsed = spells.find(w => w.system.combatType.value === 'attack')?._id;
    }
    const spell = spells.find(w => w._id === mystic.spellUsed);
    const spellUsedEffect =
      spell?.system.grades[mystic.spellGrade].description.value ?? '';
    mystic.damage.final = mystic.damage.special + damageCheck(spellUsedEffect);
    mystic.spellCasting = this.attackerActor.mysticCanCastEvaluate(
      spell,
      mystic.spellGrade,
      mystic.spellCasting.casted,
      mystic.spellCasting.override
    );

    const { weapons } = this.attackerActor.system.combat;

    const weapon = weapons.find(w => w._id === combat.weaponUsed);

    combat.unarmed = weapons.length === 0;

    if (combat.unarmed) {
      combat.damage.final =
        combat.damage.special +
        10 +
        this.attackerActor.system.characteristics.primaries.strength.mod;
    } else {
      combat.weapon = weapon;
      if (weapon?.system.isRanged.value) {
        combat.projectile = {
          value: true,
          type: weapon.system.shotType.value
        };
      } else {
        combat.projectile = {
          value: false,
          type: ''
        };
      }

      if (!combat.criticSelected) {
        combat.criticSelected = weapon.system.critic.primary.value;
      }

      ui.weaponHasSecondaryCritic =
        weapon.system.critic.secondary.value !==
        game.animabf.weapon.NoneWeaponCritic.NONE;

      combat.damage.final = combat.damage.special + weapon.system.damage.final.value;
    }

    this.modalData.config = ABFConfig;

    return this.modalData;
  }

  async _updateObject(event, formData) {
    const prevWeapon = this.modalData.attacker.combat.weaponUsed;
    const prevSpell = this.modalData.attacker.mystic.spellUsed;
    const prevPower = this.modalData.attacker.psychic.powerUsed;

    if (
      Object.prototype.hasOwnProperty.call(formData, 'attacker.mystic.spellUsed') &&
      formData['attacker.mystic.spellUsed'] === ''
    ) {
      delete formData['attacker.mystic.spellUsed'];
    }
    if (
      Object.prototype.hasOwnProperty.call(formData, 'attacker.mystic.spellGrade') &&
      formData['attacker.mystic.spellGrade'] === ''
    ) {
      delete formData['attacker.mystic.spellGrade'];
    }

    this.modalData = foundry.utils.mergeObject(this.modalData, formData);

    if (prevWeapon !== this.modalData.attacker.combat.weaponUsed) {
      this.modalData.attacker.combat.criticSelected = undefined;
    }
    if (prevSpell !== this.modalData.attacker.mystic.spellUsed) {
      const { spells } = this.attackerActor.system.mystic;
      const spell = spells.find(w => w._id === this.modalData.attacker.mystic.spellUsed);
      this.modalData.attacker.mystic.critic =
        spell?.system.critic.value ?? game.animabf.weapon.NoneWeaponCritic.NONE;
      this.modalData.attacker.mystic.spellGrade = 'base';
      this.modalData.attacker.mystic.attainableSpellGrades = [];
      const intelligence =
        this.attackerActor.system.characteristics.primaries.intelligence.value;
      const finalIntelligence = this.attackerActor.system.mystic.mysticSettings
        .aptitudeForMagicDevelopment
        ? intelligence + 3
        : intelligence;
      for (const grade in spell?.system.grades) {
        if (finalIntelligence >= spell?.system.grades[grade].intRequired.value) {
          this.modalData.attacker.mystic.attainableSpellGrades.push(grade);
        }
      }
    }
    if (this.modalData.attacker.mystic.spellCasting.override) {
      this.modalData.attacker.mystic.attainableSpellGrades = [
        'base',
        'intermediate',
        'advanced',
        'arcane'
      ];
    }
    if (prevPower !== this.modalData.attacker.psychic.powerUsed) {
      const { psychicPowers } = this.attackerActor.system.psychic;
      const power = psychicPowers.find(
        w => w._id === this.modalData.attacker.psychic.powerUsed
      );
      this.modalData.attacker.psychic.critic =
        power?.system.critic.value ?? game.animabf.weapon.NoneWeaponCritic.NONE;
    }

    this.render();
  }
}
