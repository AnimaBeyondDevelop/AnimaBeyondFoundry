import { Templates } from '../../utils/constants';
import { NoneWeaponCritic, WeaponCritic } from '../../types/combat/WeaponItemConfig';
import { energyCheck } from '../../combat/utils/energyCheck.js';
import { resistanceCheck } from '../../combat/utils/resistanceCheck.js';
import { damageCheck } from '../../combat/utils/damageCheck.js';
import { evaluateCast } from '../../combat/utils/evaluateCast.js';
import { innateCheck } from '../../combat/utils/innateCheck.js';
import { psychicFatigue } from '../../combat/utils/psychicFatigue.js';
import { psychicImbalanceCheck } from '../../combat/utils/psychicImbalanceCheck.js';
import { psychicPotentialEffect } from '../../combat/utils/psychicPotentialEffect.js';
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
      combat: {
        fatigueUsed: 0,
        modifier: 0,
        unarmed: false,
        weaponUsed: undefined,
        criticSelected: undefined,
        weapon: undefined,
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
        specialType:'material',
        damage: {
          special: 0,
          final: 0
        }
      },
      mystic: {
        modifier: 0,
        magicProjectionType: 'offensive',
        spellUsed: undefined,
        spellGrade: 'base',
        spellPrepared: false,
        castPrepared: false,
        spellInnate: false,
        castInnate: false,
        zeonAccumulated: 0,
        critic: NoneWeaponCritic.NONE,
        checkResistance: false,
        resistanceType: undefined,
        resistanceCheck: 0,
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
        specialType:'energy',
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
        critic: NoneWeaponCritic.NONE,
        fatigueCheck: false,
        checkResistance: false,
        resistanceType: undefined,
        resistanceCheck: 0,
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
        specialType:'intangible',
        damage: 0
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
    this.modalData.attacker.zen = this.attackerActor.system.general.settings.zen.value;
    this.modalData.attacker.inhuman = this.attackerActor.system.general.settings.inhuman.value;
    this.modalData.attacker.inmaterial = this.attackerActor.system.general.settings.inmaterial.value;

    if(this.modalData.attacker.combat.distance.enable){
      const calculateDistance = Math.floor(canvas.grid.measureDistance(this.modalData.attacker.token, this.modalData.defender.token));
      this.modalData.attacker.combat.distance.value = calculateDistance;
      this.modalData.attacker.mystic.distance.value = calculateDistance;
      this.modalData.attacker.psychic.distance.value = calculateDistance;
    };

    const { weapons } = this.attackerActor.system.combat;
    const { spells } = this.attackerActor.system.mystic;
    const { psychicPowers } = this.attackerActor.system.psychic;

    if (psychicPowers.length > 0) {
        psychicPowers.powerUsed = psychicPowers.filter(w => w.system.combatType.value === "attack")[0]?._id;
        const power = psychicPowers.find(w => w._id === psychicPowers.powerUsed);
        this.attackerActor.system.psychic.psychicPotential.special = power?.system.bonus.value;
        this.modalData.attacker.psychic.critic = power?.system.critic.value;
    };

    if (spells.length > 0) {
      const { mystic } = this.modalData.attacker;
      spells.spellUsed = spells.filter(w => w.system.combatType.value === "attack")[0]?._id;
      const spell = spells.find(w => w._id === spells.spellUsed);
      const spellUsedEffect = spell?.system.grades.base.description.value;
      mystic.damage.final = mystic.damage.special + damageCheck(spellUsedEffect)[0]
      mystic.zeonAccumulated = this.attackerActor.system.mystic.zeon.accumulated.value ?? 0
      mystic.spellPrepared = this.attackerActor.system.mystic.preparedSpells.find(ps => ps.name == spell.name && ps.system.grade.value == mystic.spellGrade)?.system.prepared.value ?? false;
      let actType = 'main';
      mystic.spellInnate = innateCheck(this.attackerActor.system.mystic.act[actType].final.value, this.attackerActor.system.general.advantages, spell?.system.grades.base.zeon.value);
    };

    if (weapons.length > 0) {
      this.modalData.attacker.combat.weaponUsed = weapons[0]._id;
      const lastWeaponUsed = this.attackerActor.getFlag('world', `${this.attackerActor._id}.lastWeaponUsed`)
      this.modalData.attacker.combat.weaponUsed = lastWeaponUsed || weapons[0]._id;
    } else {
      this.modalData.attacker.combat.unarmed = true;
    };

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
      const { combat:{
              weapon,
              criticSelected,
              modifier,
              fatigueUsed,
              damage,
              weaponUsed,
              unarmed,
              visible,
              specialType,
              distance
              }, poorVisibility, targetInCover, inmaterial } = this.modalData.attacker;
      const inmaterialDefender = this.modalData.defender.actor.system.general.settings.inmaterial.value;
      this.attackerActor.setFlag('world', `${this.attackerActor._id}.lastWeaponUsed`, weaponUsed);
      if (typeof damage !== 'undefined') {
        let combatModifier = 0;
        let projectile = {value: false, type: ''}
        if (weapon?.system.isRanged.value){
            projectile = {
                value: true,
                type: weapon.system.shotType.value
            };
            if (distance.check || (distance.enable && distance.value <= 1)) { combatModifier += 30 };
            if (poorVisibility) { combatModifier -= 20 };
            if (targetInCover) { combatModifier -= 40 };
        };
        if (weapon !== undefined && criticSelected !== NoneWeaponCritic.NONE && criticSelected == weapon?.system.critic.secondary.value){ combatModifier -= 10 };
        const attack = weapon
          ? weapon.system.attack.final.value
          : this.attackerActor.system.combat.attack.final.value;

        const counterAttackBonus = this.modalData.attacker.counterAttackBonus ?? 0;
        const newModifier = combatModifier + modifier ?? 0
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

        const critic = criticSelected ?? WeaponCritic.IMPACT;
        let checkRes = [false, "", 0];
        if(weapon !== undefined){
        checkRes = resistanceCheck(weapon.system.special.value)
        };
        let specialTypeCheck = specialType;
        let unableToAttack = false;
        if  (energyCheck(critic)) {specialTypeCheck = 'materialEnergy'}
        else if (!inmaterial && inmaterialDefender) {unableToAttack = true};
        if (inmaterial && !inmaterialDefender) {damage.final = 0}
        else {checkRes = [false, "", 0]};
        if  (inmaterial) {specialTypeCheck = 'inmaterial'};

        const rolled =
          roll.total -
          counterAttackBonus -
          attack -
          (modifier ?? 0) -
          (fatigueUsed ?? 0) * 15;

        this.hooks.onAttack({
          type: 'combat',
          values: {
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
            checkResistance: checkRes[0],
            resistanceType: checkRes[1],
            resistanceCheck: checkRes[2],
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
      const { magicProjectionType, spellGrade, spellUsed, modifier, critic, damage, projectile, specialType, spellInnate, castInnate, spellPrepared, castPrepared, zeonAccumulated, distance} = this.modalData.attacker.mystic;
      const inmaterialDefender = this.modalData.defender.actor.system.general.settings.inmaterial.value;
      if (spellUsed) {
        let baseMagicProjection;
        let magicProjection;
        if (magicProjectionType === 'normal') {
          magicProjection = this.attackerActor.system.mystic.magicProjection.final.value;
          baseMagicProjection =
            this.attackerActor.system.mystic.magicProjection.base.value;
        } else {
          magicProjection =
            this.attackerActor.system.mystic.magicProjection.imbalance.offensive.final
              .value;
          baseMagicProjection =
            this.attackerActor.system.mystic.magicProjection.imbalance.offensive.base
              .value;
        }

        const { spells } = this.attackerActor.system.mystic;
        const spell = spells.find(w => w._id === spellUsed);
        const spellUsedEffect = spell?.system.grades[spellGrade].description.value ?? "";
        const zeonCost = spell?.system.grades[spellGrade].zeon.value;
        let evaluateCastMsj = evaluateCast(spellInnate, castInnate, spellPrepared, castPrepared, zeonAccumulated, zeonCost);
        if (evaluateCastMsj !== undefined) { return evaluateCastMsj };
        let visibleCheck = spell?.system.visible.value;
        let specialTypeCheck = specialType;
        if  (spell?.system.spellType.value == 'animatic') {specialTypeCheck = 'intangible'}
        else if (spell?.system.via.value == 'light') {specialTypeCheck = 'attackSpellLight'}
        else if (spell?.system.via.value == 'darkness') {specialTypeCheck = 'attackSpellDarkness'};
        let checkRes = resistanceCheck(spellUsedEffect);

        let formula = `1d100xa + ${magicProjection} + ${modifier ?? 0}`;
        if (this.modalData.attacker.withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (baseMagicProjection >= 200) {
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

        const rolled = roll.total - magicProjection - (modifier ?? 0);
        let unableToAttack = false;
        if (inmaterialDefender && specialTypeCheck == specialType ) {unableToAttack = true};

        this.hooks.onAttack({
          type: 'mystic',
          values: {
            modifier,
            spellUsed,
            spellGrade,
            spellName: spell.name,
            magicProjection,
            critic,
            damage: damage.final,
            roll: rolled,
            total: roll.total,
            fumble: roll.fumbled,
            checkResistance: checkRes[0],
            resistanceType: checkRes[1],
            resistanceCheck: checkRes[2],
            visible: visibleCheck,
            distance,
            projectile,
            specialType : specialTypeCheck,
            unableToAttack,
            innate: spellInnate && castInnate,
            prepared: spellPrepared && castPrepared,
            zeonCost,
            macro: spell.macro
          }
        });

        this.modalData.attackSent = true;

        this.render();
      }
    });

    html.find('.send-psychic-attack').click(() => {
      const { powerUsed, modifier, psychicPotential, psychicProjection, critic, damage, projectile, specialType, distance} =
        this.modalData.attacker.psychic;
      const { inhuman, zen } =this.modalData.attacker;
      const inmaterialDefender = this.modalData.defender.actor.system.general.settings.inmaterial.value;
      if (powerUsed) {
        let formula = `1d100xa + ${psychicProjection} + ${modifier ?? 0}`;
        if (this.modalData.attacker.withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (this.attackerActor.system.psychic.psychicProjection.base.value >= 200) {
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
        let imbalance = psychicImbalanceCheck(power?.system.discipline.value, this.attackerActor.system.general.advantages) ?? 0;
        const newPotentialTotal = psychicPotentialEffect (psychicPotentialRoll.total, imbalance, inhuman, zen);
        const powerUsedEffect = power?.system.effects[newPotentialTotal].value;
        let newDamage = damageCheck(powerUsedEffect)[0] + damage;
        let checkRes = resistanceCheck(powerUsedEffect);
        let fatigueInmune = this.attackerActor.system.general.advantages.find(i => i.name === "Res. a la fatiga psíquica");
        let fatigueCheck = psychicFatigue(powerUsedEffect, fatigueInmune);
        let fatiguePen = fatigueCheck[1];
        let visibleCheck = power?.system.visible.value;
        let specialTypeCheck = specialType;
        if  (visibleCheck) {specialTypeCheck = 'energy'};

        if (this.modalData.attacker.showRoll) {
          const { i18n } = game;

          const powers = this.attackerActor.system.psychic.psychicPowers;

          const power = powers.find(w => w._id === powerUsed);
          if (fatigueCheck[0]){
              psychicPotentialRoll.toMessage({
                  speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
                  flavor: i18n.format('macros.combat.dialog.psychicPotentialFatigue.title', {
                      fatiguePen
                  })
              });
              this.attackerActor.applyFatigue(fatiguePen);
          }
          else{ psychicPotentialRoll.toMessage({
                  speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
                  flavor: i18n.format('macros.combat.dialog.psychicPotential.title')
              });
              const projectionFlavor = i18n.format('macros.combat.dialog.psychicAttack.title', {
                  power: power.name,
                  target: this.modalData.defender.token.name,
                  potential: psychicPotentialRoll.total
              });
              psychicProjectionRoll.toMessage({
                  speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
                  flavor: projectionFlavor
              });
          };
        }

        const rolled = psychicProjectionRoll.total - psychicProjection - (modifier ?? 0);
        let unableToAttack = false;
        if (inmaterialDefender) {unableToAttack = true};
        this.hooks.onAttack({
          type: 'psychic',
          values: {
            modifier,
            powerUsed,
            powerName : power.name,
            psychicPotential: psychicPotentialRoll.total,
            psychicProjection,
            critic,
            damage: newDamage,
            fatigueCheck: fatigueCheck[0],
            roll: rolled,
            total: psychicProjectionRoll.total,
            fumble: psychicProjectionRoll.fumbled,
            checkResistance: checkRes[0],
            resistanceType: checkRes[1],
            resistanceCheck: checkRes[2],
            visible: visibleCheck,
            distance,
            projectile,
            specialType : specialTypeCheck,
            unableToAttack,
            macro: power.macro
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
            psychic.powerUsed = psychicPowers.filter(w => w.system.combatType.value === "attack")[0]?._id;
        };
    const power = psychicPowers.find(w => w._id === psychic.powerUsed);
    psychic.critic = power?.system.critic.value ?? NoneWeaponCritic.NONE;
    let psychicBonus = power?.system.bonus.value ?? 0
    psychic.psychicPotential.final =
      psychic.psychicPotential.special +
      this.attackerActor.system.psychic.psychicPotential.final.value + psychicBonus;
    const { spells } = this.attackerActor.system.mystic;
    if (!mystic.spellUsed) {
        mystic.spellUsed = spells.filter(w => w.system.combatType.value === "attack")[0]?._id
    };
    const spell = spells.find(w => w._id === mystic.spellUsed);
    mystic.critic = spell?.system.critic.value ?? NoneWeaponCritic.NONE;
    const spellUsedEffect = spell?.system.grades[mystic.spellGrade].description.value ?? "";
    mystic.damage.final = mystic.damage.special + damageCheck(spellUsedEffect)[0];
    mystic.spellPrepared = this.attackerActor.system.mystic.preparedSpells.find(ps => ps.name == spell.name && ps.system.grade.value == mystic.spellGrade)?.system.prepared.value ?? false;
    let actType = 'main';
    mystic.spellInnate = innateCheck(this.attackerActor.system.mystic.act[actType].final.value, this.attackerActor.system.general.advantages, spell?.system.grades[mystic.spellGrade].zeon.value);
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
      if (weapon?.system.isRanged.value){
          combat.projectile = {
              value: true,
              type: weapon.system.shotType.value
          };
      }
      else {
          combat.projectile = {
              value: false,
              type: ''
          };
      };

      if (!combat.criticSelected) {
        combat.criticSelected = weapon.system.critic.primary.value;
      }

      ui.weaponHasSecondaryCritic =
        weapon.system.critic.secondary.value !== NoneWeaponCritic.NONE;

      combat.damage.final = combat.damage.special + weapon.system.damage.final.value;
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
