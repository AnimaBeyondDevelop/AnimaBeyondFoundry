import { Templates } from '../../utils/constants';
import { NoneWeaponCritic, WeaponCritic } from '../../types/combat/WeaponItemConfig';
import { energyCheck } from '../../combat/utils/energyCheck.js';
import { resistanceEffectCheck } from '../../combat/utils/resistanceEffectCheck.js';
import { weaponSpecialCheck } from '../../combat/utils/weaponSpecialCheck.js';
import { damageCheck } from '../../combat/utils/damageCheck.js';
import { mysticSpellCastEvaluate } from '../../combat/utils/mysticSpellCastEvaluate.js';
import { evaluateCast } from '../../combat/utils/evaluateCast.js';
import { supSpecificAttack } from '../../combat/utils/supSpecificAttack.js';
import { psychicFatigue } from '../../combat/utils/psychicFatigue.js';
import { psychicImbalanceCheck } from '../../combat/utils/psychicImbalanceCheck.js';
import { psychicPotentialEffect } from '../../combat/utils/psychicPotentialEffect.js';
import { roundTo5Multiples } from '../../combat/utils/roundTo5Multiples';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { ABFConfig } from '../../ABFConfig';

const getInitialData = (attacker, defender, options = {}) => {
  const combatDistance = !!game.settings.get(
    'animabf',
    ABFSettingsKeys.AUTOMATE_COMBAT_DISTANCE
  );
  const showRollByDefault = !!game.settings.get(
    'animabf',
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
      zen: false,
      inhuman: false,
      inmaterial: false,
      specificAttacks: [
        'none',
        'knockDown',
        'disable',
        'disarm',
        'immobilize',
        'knockOut',
        'targeted'
      ],
      targetedAttacks: [],
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
        distance: {
          value: 0,
          enable: combatDistance,
          check: false
        },
        projectile: {
          value: false,
          type: ''
        },
        specialType: 'material',
        damage: {
          special: 0,
          final: 0
        },
        specificAttack: {
          value: 'none',
          causeDamage: true,
          characteristic: undefined,
          check: false,
          targeted: 'none',
          weakspot: false
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
        spellCasting: {
          zeon: { accumulated: 0, cost: 0 },
          spell: { prepared: false, innate: false },
          cast: { prepared: false, innate: false },
          override: { value: false, ui: false }
        },
        critic: NoneWeaponCritic.NONE,
        resistanceEffect: { value: 0, type: undefined, check: false },
        visible: false,
        distance: {
          value: 0,
          enable: combatDistance,
          check: false
        },
        projectile: {
          value: true,
          type: 'shot'
        },
        specialType: 'energy',
        damage: {
          special: 0,
          final: 0
        }
      },
      psychic: {
        modifier: 0,
        psychicProjection: {
          base: attackerActor.system.psychic.psychicProjection.imbalance.offensive.base
            .value,
          final:
            attackerActor.system.psychic.psychicProjection.imbalance.offensive.final.value
        },
        psychicPotential: {
          special: 0,
          final: attackerActor.system.psychic.psychicPotential.final.value
        },
        powerUsed: undefined,
        critic: NoneWeaponCritic.NONE,
        fatigueCheck: false,
        resistanceEffect: { value: 0, type: undefined, check: false },
        visible: false,
        distance: {
          value: 0,
          enable: combatDistance,
          check: false
        },
        projectile: {
          value: true,
          type: 'shot'
        },
        specialType: 'intangible',
        damage: 0
      },
      domine: {
        techniqueUsed: undefined,
        technique: undefined,
        isTechniqueActive: false,
        kiAccumulation: attackerActor.system.domine.kiAccumulation
      }
    },
    defender: {
      token: defender,
      actor: defenderActor
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
    this._tabs[0].callback = (event, tabs, tabName) => {
      this.modalData.ui.activeTab = tabName;
      this.render(true);
    };
    this.modalData.attacker.zen = this.attackerActor.system.general.settings.zen.value;
    this.modalData.attacker.inhuman =
      this.attackerActor.system.general.settings.inhuman.value;
    this.modalData.attacker.inmaterial =
      this.attackerActor.system.general.settings.inmaterial.value;

    if (this.modalData.attacker.combat.distance.enable) {
      const calculateDistance = Math.floor(
        canvas.grid.measureDistance(
          this.modalData.attacker.token,
          this.modalData.defender.token
        )
      );
      this.modalData.attacker.combat.distance.value = calculateDistance;
      this.modalData.attacker.mystic.distance.value = calculateDistance;
      this.modalData.attacker.psychic.distance.value = calculateDistance;
    }

    const { weapons } = this.attackerActor.system.combat;
    const { spells } = this.attackerActor.system.mystic;
    const { psychicPowers } = this.attackerActor.system.psychic;
    const { techniques } = this.attackerActor.system.domine;

    if (psychicPowers.length > 0) {
      const { psychic } = this.modalData.attacker;
      const lastOffensivePowerUsed = this.attackerActor.getFlag(
        'world',
        `${this.attackerActor._id}.lastOffensivePowerUsed`
      );
      psychic.powerUsed =
        lastOffensivePowerUsed ||
        psychicPowers.filter(w => w.system.combatType.value === 'attack')[0]?._id;
      const power = psychicPowers.find(w => w._id === psychic.powerUsed);
      this.attackerActor.system.psychic.psychicPotential.special =
        power?.system.bonus.value;
      this.modalData.attacker.psychic.critic = power?.system.critic.value;
    }

    if (spells.length > 0) {
      const { mystic } = this.modalData.attacker;
      const lastOffensiveSpellUsed = this.attackerActor.getFlag(
        'world',
        `${this.attackerActor._id}.lastOffensiveSpellUsed`
      );
      mystic.spellUsed =
        lastOffensiveSpellUsed ||
        spells.filter(w => w.system.combatType.value === 'attack')[0]?._id;
      const spell = spells.find(w => w._id === mystic.spellUsed);
      const spellUsedEffect = spell?.system.grades.base.description.value;
      mystic.damage.final = mystic.damage.special + damageCheck(spellUsedEffect)[0];
      mystic.spellCasting.zeon.accumulated =
        this.attackerActor.system.mystic.zeon.accumulated.value ?? 0;
      const mysticSpellCheck = mysticSpellCastEvaluate(
        this.attackerActor,
        spell,
        mystic.spellGrade
      );
      mystic.spellCasting.spell = mysticSpellCheck;
      const spellCastingOverride = this.attackerActor.getFlag(
        'world',
        `${this.attackerActor._id}.spellCastingOverride`
      );
      mystic.spellCasting.override.value = spellCastingOverride || false;
      mystic.spellCasting.override.ui = spellCastingOverride || false;
    }

    if (weapons.length > 0) {
      const lastOffensiveWeaponUsed = this.attackerActor.getFlag(
        'world',
        `${this.attackerActor._id}.lastOffensiveWeaponUsed`
      );
      this.modalData.attacker.combat.weaponUsed =
        lastOffensiveWeaponUsed || weapons[0]._id;
    } else {
      this.modalData.attacker.combat.unarmed = true;
    }

    if (techniques.length > 0) {
      const { domine } = this.modalData.attacker;
      domine.techniqueUsed = techniques.find(w =>
        w.system.combatVisibility.includes('attack')
      )?._id;
      domine.technique = techniques.find(w => w._id === domine.techniqueUsed);
      domine.isTechniqueActive = domine.technique?.system.activeEffect.enabled;
    }

    this.modalData.attacker.targetedAttacks = [
      { bodyPart: 'none', modifier: 0, weakspot: false },
      { bodyPart: 'neck', modifier: -80, weakspot: true },
      { bodyPart: 'head', modifier: -60, weakspot: true },
      { bodyPart: 'elbow', modifier: -60, weakspot: false },
      { bodyPart: 'heart', modifier: -60, weakspot: true },
      { bodyPart: 'groin', modifier: -60, weakspot: false },
      { bodyPart: 'foot', modifier: -50, weakspot: false },
      { bodyPart: 'hand', modifier: -40, weakspot: false },
      { bodyPart: 'knee', modifier: -40, weakspot: false },
      { bodyPart: 'abdomen', modifier: -20, weakspot: false },
      { bodyPart: 'arm', modifier: -20, weakspot: false },
      { bodyPart: 'thigh', modifier: -20, weakspot: false },
      { bodyPart: 'calf', modifier: -10, weakspot: false },
      { bodyPart: 'torso', modifier: -10, weakspot: false },
      { bodyPart: 'eye', modifier: -100, weakspot: false },
      { bodyPart: 'wrist', modifier: -40, weakspot: false },
      { bodyPart: 'shoulder', modifier: -30, weakspot: false }
    ];

    this.modalData.allowed = game.user?.isGM || (options.allowed ?? false);

    this.hooks = hooks;

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['abf-dialog combat-attack-dialog no-close'],
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

    // eslint-disable-next-line no-useless-return,consistent-return
    return;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.send-attack').click(() => {
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
          specialType,
          distance,
          specificAttack
        },
        targetedAttacks,
        highGround,
        poorVisibility,
        targetInCover,
        inmaterial
      } = this.modalData.attacker;
      const inmaterialDefender =
        this.modalData.defender.actor.system.general.settings.inmaterial.value;
      this.attackerActor.setFlag(
        'world',
        `${this.attackerActor._id}.lastOffensiveWeaponUsed`,
        weaponUsed
      );
      if (typeof damage !== 'undefined') {
        let combatModifier = 0;
        let projectile = { value: false, type: '' };
        if (weapon?.system.isRanged.value) {
          projectile = {
            value: true,
            type: weapon.system.shotType.value
          };
          if (
            (!distance.enable && distance.check) ||
            (distance.enable && distance.value <= 1)
          ) {
            combatModifier += 30;
          }
          if (highGround) {
            combatModifier += 20;
          }
          if (poorVisibility) {
            combatModifier -= 20;
          }
          if (targetInCover) {
            combatModifier -= 40;
          }
        }
        if (
          weapon !== undefined &&
          criticSelected !== NoneWeaponCritic.NONE &&
          criticSelected == weapon?.system.critic.secondary.value
        ) {
          combatModifier -= 10;
        }
        const critic = criticSelected ?? WeaponCritic.IMPACT;
        const attack = weapon
          ? weapon.system.attack.final.value
          : this.attackerActor.system.combat.attack.final.value;
        if (specificAttack.value !== 'none') {
          if (specificAttack.value == 'knockDown') {
            specificAttack.check = true;
            if (
              unarmed ||
              weapon.name == 'Desarmado' ||
              weapon.system.size.value !== 'small'
            ) {
              combatModifier -= 30;
            } else {
              combatModifier -= 60;
            }
          } else if (specificAttack.value == 'disarm') {
            specificAttack.check = true;
            combatModifier -= 40;
          } else if (specificAttack.value == 'immobilize') {
            specificAttack.check = true;
            combatModifier -= 40;
          } else if (specificAttack.value == 'knockOut') {
            specificAttack.targeted = 'head';
            if (critic !== NoneWeaponCritic.IMPACT) {
              combatModifier -= 40;
            }
          }
          if (specificAttack.targeted !== 'none') {
            specificAttack.weakspot = targetedAttacks.find(
              i => i.bodyPart == specificAttack.targeted
            )?.weakspot;
            if (specificAttack.value == 'disable') {
              specificAttack.weakspot = true;
            }
            combatModifier +=
              targetedAttacks.find(i => i.bodyPart == specificAttack.targeted)
                ?.modifier ?? 0;
          }
        }
        const counterAttackBonus = this.modalData.attacker.counterAttackBonus ?? 0;
        const newModifier = combatModifier + modifier ?? 0;
        let formula = `1d100xa + ${counterAttackBonus} + ${attack} + ${newModifier} + ${
          fatigueUsed ?? 0
        }* 15`;
        if (this.modalData.attacker.withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (this.attackerActor.system.combat.attack.base.value >= 200) {
          // Mastery reduces the fumble range
          formula = formula.replace('xa', 'xamastery');
        }

        const roll = new ABFFoundryRoll(formula, this.attackerActor.system);

        roll.roll();

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

        let resistanceEffect = { value: 0, type: undefined, check: false };
        if (weapon !== undefined) {
          resistanceEffect = resistanceEffectCheck(weapon.system.special.value);
        }
        let specialTypeCheck = specialType;
        let unableToAttack = false;
        if (energyCheck(critic)) {
          specialTypeCheck = 'materialEnergy';
        } else if (!inmaterial && inmaterialDefender) {
          unableToAttack = true;
        }
        if (inmaterial && !inmaterialDefender) {
          damage.final = 0;
        } else {
          resistanceEffect = { value: 0, type: undefined, check: false };
        }
        if (inmaterial) {
          specialTypeCheck = 'inmaterial';
        }

        const rolled =
          roll.total -
          counterAttackBonus -
          attack -
          (newModifier ?? 0) -
          (fatigueUsed ?? 0) * 15;

        this.hooks.onAttack({
          type: 'combat',
          values: {
            specificAttack,
            targetedAttacks,
            unarmed,
            damage: damage.final,
            attack,
            weaponUsed,
            critic,
            modifier: newModifier,
            fatigueUsed,
            roll: rolled,
            total: roll.total,
            fumble: roll.fumbled,
            resistanceEffect,
            visible,
            distance,
            projectile,
            specialType: specialTypeCheck,
            unableToAttack
          }
        });

        this.modalData.attackSent = true;

        this.render();
      }
    });

    html.find('.send-mystic-attack').click(() => {
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
          specialType,
          distance
        },
        targetedAttacks
      } = this.modalData.attacker;
      const inmaterialDefender =
        this.modalData.defender.actor.system.general.settings.inmaterial.value;
      if (spellUsed) {
        this.attackerActor.setFlag(
          'world',
          `${this.attackerActor._id}.spellCastingOverride`,
          spellCasting.override.value
        );
        this.attackerActor.setFlag(
          'world',
          `${this.attackerActor._id}.lastOffensiveSpellUsed`,
          spellUsed
        );
        const { spells } = this.attackerActor.system.mystic;
        const spell = spells.find(w => w._id === spellUsed);
        const spellUsedEffect = spell?.system.grades[spellGrade].description.value ?? '';
        spellCasting.zeon.cost = spell?.system.grades[spellGrade].zeon.value;
        let evaluateCastMsj = evaluateCast(spellCasting);
        if (evaluateCastMsj !== undefined) {
          spellCasting.override.ui = true;
          return evaluateCastMsj;
        }
        let visibleCheck = spell?.system.visible.value;
        let specialTypeCheck = specialType;
        if (spell?.system.spellType.value == 'animatic') {
          specialTypeCheck = 'intangible';
        } else if (spell?.system.via.value == 'light') {
          specialTypeCheck = 'attackSpellLight';
        } else if (spell?.system.via.value == 'darkness') {
          specialTypeCheck = 'attackSpellDarkness';
        }

        let resistanceEffect = resistanceEffectCheck(spellUsedEffect);
        const specificAttack = supSpecificAttack(spellUsedEffect);

        let formula = `1d100xa + ${magicProjection.final} + ${modifier ?? 0}`;
        if (this.modalData.attacker.withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (magicProjection.base >= 200) {
          // Mastery reduces the fumble range
          formula = formula.replace('xa', 'xamastery');
        }

        const roll = new ABFFoundryRoll(formula, this.attackerActor.system);
        roll.roll();

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

        const rolled = roll.total - magicProjection.final - (modifier ?? 0);
        let unableToAttack = false;
        if (inmaterialDefender && specialTypeCheck == specialType) {
          unableToAttack = true;
        }

        this.hooks.onAttack({
          type: 'mystic',
          values: {
            modifier,
            spellUsed,
            spellGrade,
            spellName: spell.name,
            magicProjection: magicProjection.final,
            critic,
            damage: damage.final,
            roll: rolled,
            total: roll.total,
            fumble: roll.fumbled,
            resistanceEffect,
            visible: visibleCheck,
            distance,
            projectile,
            specialType: specialTypeCheck,
            unableToAttack,
            spellCasting,
            specificAttack,
            targetedAttacks,
            macro: spell.macro
          }
        });

        this.modalData.attackSent = true;

        this.render();
      }
    });

    html.find('.send-psychic-attack').click(() => {
      const {
        psychic: {
          powerUsed,
          modifier,
          psychicPotential,
          psychicProjection,
          critic,
          damage,
          projectile,
          specialType,
          distance
        },
        targetedAttacks,
        inhuman,
        zen
      } = this.modalData.attacker;
      const inmaterialDefender =
        this.modalData.defender.actor.system.general.settings.inmaterial.value;
      if (powerUsed) {
        this.attackerActor.setFlag(
          'world',
          `${this.attackerActor._id}.lastOffensivePowerUsed`,
          powerUsed
        );
        let formula = `1d100xa + ${psychicProjection.final} + ${modifier ?? 0}`;
        if (this.modalData.attacker.withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (psychicProjection.base >= 200) {
          // Mastery reduces the fumble range
          formula = formula.replace('xa', 'xamastery');
        }

        const psychicProjectionRoll = new ABFFoundryRoll(
          formula,
          this.attackerActor.system
        );
        psychicProjectionRoll.roll();

        const psychicPotentialRoll = new ABFFoundryRoll(
          `1d100xa + ${psychicPotential.final}`,
          this.modalData.attacker.actor.system
        );
        psychicPotentialRoll.roll();
        const { psychicPowers } = this.attackerActor.system.psychic;
        const power = psychicPowers.find(w => w._id === powerUsed);
        let imbalance = psychicImbalanceCheck(this.attackerActor, power) ?? 0;
        const newPotentialTotal = psychicPotentialEffect(
          psychicPotentialRoll.total,
          imbalance,
          inhuman,
          zen
        );
        const powerUsedEffect = power?.system.effects[newPotentialTotal].value;
        let newDamage = damageCheck(powerUsedEffect)[0] + damage;
        let resistanceEffect = resistanceEffectCheck(powerUsedEffect);
        const specificAttack = supSpecificAttack(powerUsedEffect);
        let fatigueInmune = this.attackerActor.system.general.advantages.find(
          i => i.name === 'Res. a la fatiga psíquica'
        );
        let fatigueCheck = psychicFatigue(powerUsedEffect, fatigueInmune);
        let fatiguePen = fatigueCheck[1];
        let visibleCheck = power?.system.visible.value;
        let specialTypeCheck = specialType;
        if (visibleCheck) {
          specialTypeCheck = 'energy';
        }

        if (this.modalData.attacker.showRoll) {
          const { i18n } = game;

          if (fatigueCheck[0]) {
            psychicPotentialRoll.toMessage({
              speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
              flavor: i18n.format('macros.combat.dialog.psychicPotentialFatigue.title', {
                fatiguePen
              })
            });
            this.attackerActor.applyFatigue(fatiguePen);
          } else {
            psychicPotentialRoll.toMessage({
              speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
              flavor: i18n.format('macros.combat.dialog.psychicPotential.title')
            });
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

        const rolled =
          psychicProjectionRoll.total - psychicProjection.final - (modifier ?? 0);
        let unableToAttack = false;
        if (inmaterialDefender) {
          unableToAttack = true;
        }
        this.hooks.onAttack({
          type: 'psychic',
          values: {
            modifier,
            powerUsed,
            powerName: power.name,
            psychicPotential: psychicPotentialRoll.total,
            psychicProjection: psychicProjection.final,
            critic,
            damage: newDamage,
            fatigueCheck: fatigueCheck[0],
            roll: rolled,
            total: psychicProjectionRoll.total,
            fumble: psychicProjectionRoll.fumbled,
            resistanceEffect,
            visible: visibleCheck,
            distance,
            projectile,
            specialType: specialTypeCheck,
            unableToAttack,
            specificAttack,
            targetedAttacks,
            macro: power.macro
          }
        });

        this.modalData.attackSent = true;

        this.render();
      }
    });

    html.find('.activate-domine-technique').click(e => {
      e.preventDefault();
      const { techniqueUsed } = this.modalData.attacker.domine;
      if (techniqueUsed) {
        let activateTechnique = this.attackerActor.activateTechnique(techniqueUsed);
        if (activateTechnique !== undefined) {
          return activateTechnique;
        }
      }
      setTimeout(() => {this.render();}, 50);
    });

    html.find('.effect-control').click(this._onEffectControl.bind(this));
    html.find('.technique-options').change(this._onTechniqueChange.bind(this));
  }
  async _onEffectControl(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const tr = a.closest('tr');
    const item = this.attackerActor.items.get(tr.dataset.itemId);
    const effect = item.effects.get(tr.dataset.effectId);
    const effects = this.attackerActor.getEmbeddedCollection('ActiveEffect').contents;
    const relevantEffect = effects.find(
      eff =>
        eff.origin.endsWith(tr.dataset.itemId) &&
        JSON.stringify(eff.changes) == JSON.stringify(effect.changes)
    );
    if (!relevantEffect) {
      return;
    }
    const status = effect.disabled;
    await effect.update({ disabled: !status });
    await relevantEffect.update({ disabled: !status });
    setTimeout(() => {this.render();}, 50);
  }

  async _onTechniqueChange(event) {
    console.log(event.currentTarget)
    console.log(this.modalData.attacker.domine.techniqueUsed)
  }

  getData() {
    const {
      attacker: { combat, psychic, mystic, domine },
      ui
    } = this.modalData;

    ui.hasFatiguePoints =
      this.attackerActor.system.characteristics.secondaries.fatigue.value > 0;

    const { techniques } = this.attackerActor.system.domine;
    if (!domine.techniqueUsed) {
      domine.techniqueUsed = techniques.find(w =>
        w.system.combatVisibility.includes('attack')
      )?._id;
    }
    domine.technique = techniques.find(w => w._id === domine.techniqueUsed);
    domine.kiAccumulation = this.attackerActor.system.domine.kiAccumulation;
    domine.isTechniqueActive = domine.technique?.system.activeEffect.enabled;

    const { psychicPowers } = this.attackerActor.system.psychic;
    if (!psychic.powerUsed) {
      psychic.powerUsed = psychicPowers.filter(
        w => w.system.combatType.value === 'attack'
      )[0]?._id;
    }
    const power = psychicPowers.find(w => w._id === psychic.powerUsed);
    psychic.critic = power?.system.critic.value ?? NoneWeaponCritic.NONE;
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
    mystic.critic = spell?.system.critic.value ?? NoneWeaponCritic.NONE;
    const spellUsedEffect =
      spell?.system.grades[mystic.spellGrade].description.value ?? '';
    mystic.damage.final = mystic.damage.special + damageCheck(spellUsedEffect)[0];
    const mysticSpellCheck = mysticSpellCastEvaluate(
      this.attackerActor,
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

    const { weapons } = this.attackerActor.system.combat;

    const weapon = weapons.find(w => w._id === combat.weaponUsed);
    const weaponSpecial = weaponSpecialCheck(weapon);
    const attackerStrength =
      this.attackerActor.system.characteristics.primaries.strength.value;
    const attackerDexterity =
      this.attackerActor.system.characteristics.primaries.dexterity.value;
    combat.specificAttack.characteristic = weaponSpecial
      ? weaponSpecial
      : Math.max(attackerStrength, attackerDexterity);
    if (
      combat.specificAttack.value !== 'knockDown' &&
      combat.specificAttack.value !== 'immobilize'
    ) {
      combat.specificAttack.causeDamage = true;
    }
    if (combat.specificAttack.value == 'disarm') {
      combat.specificAttack.causeDamage = false;
    }
    if (
      combat.specificAttack.value !== 'disable' &&
      combat.specificAttack.value !== 'targeted'
    ) {
      combat.specificAttack.targeted = 'none';
    }
    combat.unarmed =
      weapons.length === 0 ||
      (combat.specificAttack.value == 'immobilize' && !weaponSpecial);

    if (combat.unarmed) {
      const unarmedDamage =
        combat.damage.special +
        10 +
        this.attackerActor.system.characteristics.primaries.strength.mod;
      combat.damage.final = unarmedDamage;
      if (!combat.specificAttack.causeDamage) {
        combat.damage.final = 0;
      } else if (
        combat.specificAttack.value == 'knockDown' ||
        combat.specificAttack.value == 'immobilize'
      ) {
        combat.damage.final = roundTo5Multiples(unarmedDamage / 2);
      }
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
        weapon.system.critic.secondary.value !== NoneWeaponCritic.NONE;
      const armedDamage = combat.damage.special + weapon.system.damage.final.value;
      combat.damage.final = armedDamage;
      if (!combat.specificAttack.causeDamage) {
        combat.damage.final = 0;
      } else if (
        combat.specificAttack.value == 'knockDown' ||
        combat.specificAttack.value == 'immobilize'
      ) {
        combat.damage.final = roundTo5Multiples(armedDamage / 2);
      }
    }

    this.modalData.config = ABFConfig;

    return this.modalData;
  }

  async _updateObject(event, formData) {
    const prevWeapon = this.modalData.attacker.combat.weaponUsed;

    this.modalData = mergeObject(this.modalData, formData);

    if (prevWeapon !== this.modalData.attacker.combat.weaponUsed) {
      this.modalData.attacker.combat.criticSelected = undefined;
    }

    this.render();
  }
}
