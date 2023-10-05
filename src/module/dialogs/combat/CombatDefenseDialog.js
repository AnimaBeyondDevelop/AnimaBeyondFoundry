import { Templates } from '../../utils/constants';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { NoneWeaponCritic, WeaponCritic } from '../../types/combat/WeaponItemConfig';
import { energyCheck } from '../../combat/utils/energyCheck.js';
import { innateCheck } from '../../combat/utils/innateCheck.js';
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
      zen: false,
      inhuman: false,
      inmaterial: false,
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
        multipleDefensesPenalty: 0,
        accumulateDefenses: true,
        modifier: 0,
        weaponUsed: undefined,
        weapon: undefined,
        unarmed: false,
        at: {
          special: 0,
          final: 0,
          defense: false
        }
      },
      mystic: {
        modifier: 0,
        magicProjectionType: 'defensive',
        spellUsed: undefined,
        spellGrade: 'base',
        spellPrepared: false,
        castPrepared: false,
        spellInnate: false,
        castInnate: false,
        zeonAccumulated: 0,
      },
      psychic: {
        modifier: 0,
        psychicPotential: {
          special: 0,
          final: defenderActor.system.psychic.psychicPotential.final.value
        },
        psychicProjection:
          defenderActor.system.psychic.psychicProjection.imbalance.defensive.final.value,
        powerUsed: undefined
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
    const defensesCounter = this.defenderActor.getFlag('world', `${this.defenderActor._id}.defensesCounter`) || { value: true, accumulated: 0 };
    this.modalData.defender.combat.accumulateDefenses = defensesCounter.value;
    this.modalData.defender.combat.multipleDefensesPenalty = defensesCounterCheck(defensesCounter.accumulated);
    this.modalData.defender.zen = this.defenderActor.system.general.settings.zen.value;
    this.modalData.defender.inhuman = this.defenderActor.system.general.settings.inhuman.value;
    this.modalData.defender.inmaterial = this.defenderActor.system.general.settings.inmaterial.value;
    if (this.modalData.attacker.critic !== NoneWeaponCritic.NONE && this.modalData.attacker.damage == 0){
        this.modalData.defender.combat.at.defense = true;
    };

    const { weapons } = this.defenderActor.system.combat;
    const { spells } = this.defenderActor.system.mystic;
    const { psychicPowers } = this.defenderActor.system.psychic;

    if (psychicPowers.length > 0) {
        const lastDefensivePowerUsed = this.defenderActor.getFlag('world', `${this.defenderActor._id}.lastDefensivePowerUsed`);
        psychicPowers.powerUsed = lastDefensivePowerUsed || psychicPowers.filter(w => w.system.combatType.value === "attack")[0]?._id;
        const power = psychicPowers.find(w => w._id === psychicPowers.powerUsed);
        this.defenderActor.system.psychic.psychicPotential.special = power?.system.bonus.value;
    };

    if (spells.length > 0) {
      const { mystic } = this.modalData.defender;
      const lastDefensiveSpellUsed = this.defenderActor.getFlag('world', `${this.defenderActor._id}.lastDefensiveSpellUsed`);
      spells.spellUsed = lastDefensiveSpellUsed || spells.filter(w => w.system.combatType.value === "defense")[0]?._id;
      const spell = spells.find(w => w._id === spells.spellUsed);
      mystic.zeonAccumulated = this.defenderActor.system.mystic.zeon.accumulated.value ?? 0
      mystic.spellPrepared = this.defenderActor.system.mystic.preparedSpells.find(ps => ps.name == spell.name && ps.system.grade.value == mystic.spellGrade)?.system.prepared.value ?? false;
      let actType = 'main';
      mystic.spellInnate = innateCheck(this.defenderActor.system.mystic.act[actType].final.value, this.defenderActor.system.general.advantages, spell?.system.grades.base.zeon.value);
    };

    if (weapons.length > 0) {
      const lastDefensiveWeaponUsed = this.defenderActor.getFlag('world', `${this.defenderActor._id}.lastDefensiveWeaponUsed`)
      this.modalData.defender.combat.weaponUsed = lastDefensiveWeaponUsed || weapons[0]._id;
    } else {
      this.modalData.defender.combat.unarmed = true;
    }
    const perceiveMystic = this.defenderActor.system.general.settings.perceiveMystic.value;
    const perceivePsychic = this.defenderActor.system.general.settings.perceivePsychic.value;
    let blindness = false;
    let attackType = this.modalData.attacker.attackType;
    if (!this.modalData.attacker.visible) {
        if (!perceiveMystic && !perceivePsychic) { blindness = true }
        else if (attackType === 'mystic' && !perceiveMystic) { blindness = true }
        else if (attackType === 'psychic' && !perceivePsychic) { blindness = true };
    };
    if (blindness) {
        if (!this.defenderActor.effects.find(i => i.name === "Ceguera absoluta") && !this.defenderActor.effects.find(i => i.name === "Ceguera parcial")){
            this.modalData.defender.blindnessPen = -80 }
        else if (!this.defenderActor.effects.find(i => i.name === "Ceguera absoluta")){
            this.modalData.defender.blindnessPen = -50 };
    };

    let at;

    if (this.modalData.attacker.critic !== NoneWeaponCritic.NONE) {
      switch (this.modalData.attacker.critic) {
        case WeaponCritic.CUT:
          at = this.defenderActor.system.combat.totalArmor.at.cut.value;
          break;
        case WeaponCritic.IMPACT:
          at = this.defenderActor.system.combat.totalArmor.at.impact.value;
          break;
        case WeaponCritic.THRUST:
          at = this.defenderActor.system.combat.totalArmor.at.thrust.value;
          break;
        case WeaponCritic.HEAT:
          at = this.defenderActor.system.combat.totalArmor.at.heat.value;
          break;
        case WeaponCritic.ELECTRICITY:
          at = this.defenderActor.system.combat.totalArmor.at.electricity.value;
          break;
        case WeaponCritic.COLD:
          at = this.defenderActor.system.combat.totalArmor.at.cold.value;
          break;
        case WeaponCritic.ENERGY:
          at = this.defenderActor.system.combat.totalArmor.at.energy.value;
          break;
        default:
          at = undefined;
      }
    }

    if (at !== undefined) {
      this.modalData.defender.combat.at.final =
        this.modalData.defender.combat.at.special + at;
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
      const { combat: {
        fatigue, modifier, weapon, multipleDefensesPenalty, at, accumulateDefenses, weaponUsed
      },
      blindnessPen, distance, inmaterial } = 
      this.modalData.defender;
      this.defenderActor.setFlag('world', `${this.defenderActor._id}.lastDefensiveWeaponUsed`, weaponUsed);

      const type = e.currentTarget.dataset.type === 'dodge' ? 'dodge' : 'block';

      let value;
      let baseDefense;
      let unableToDefense = false;
      let combatModifier = blindnessPen;
      const projectileType = this.modalData.attacker.projectile?.type;
      if (e.currentTarget.dataset.type === 'dodge') {
        value = this.defenderActor.system.combat.dodge.final.value;
        baseDefense = this.defenderActor.system.combat.dodge.base.value;
        const maestry = (baseDefense >= 200);
        if((!distance.check || (distance.enable && distance.value > 1)) && projectileType == 'shot' && !maestry){ combatModifier -= 30 };
      }
      else {
        const attackerSpecialType = this.modalData.attacker.specialType;
        let defenderSpecialType = this.modalData.defender.specialType;
        if  (attackerSpecialType == "inmaterial" && !inmaterial) {unableToDefense = true};
        if (energyCheck(weapon?.system.critic.primary.value) ||
        energyCheck(weapon?.system.critic.secondary.value)){ 
        unableToDefense = false
      } 
      else if (defenderSpecialType[attackerSpecialType] == false){
        if (attackerSpecialType == 'energy') { combatModifier -= 120 }
        else {
            unableToDefense = true
        };
      };
      value = weapon
          ? weapon.system.block.final.value
          : this.defenderActor.system.combat.block.final.value;
      baseDefense = this.defenderActor.system.combat.block.base.value;
      const isShield = weapon?.system.isShield.value;
      const maestry = (baseDefense >= 200);
      if(!distance.check || (distance.enable && distance.value > 1)){
          if (projectileType == 'shot'){
              if(!maestry) {
                  if (!isShield) { combatModifier -= 80 } else { combatModifier -= 30 }
              } else if (!isShield) { combatModifier -= 20 }
          };
          if (projectileType == 'throw'){
              if(!maestry) {
                  if (!isShield) { combatModifier -= 50 }
              };
          };
      }
    }
    const newModifier = combatModifier + modifier ?? 0;
    let atResValue = 0;
    if (at.defense) {atResValue += at.final* 10 + 20 + 10};

      let formula = `1d100xa + ${newModifier} + ${fatigue ?? 0} * 15 - ${
        (multipleDefensesPenalty ?? 0) * -1
      } + ${value + atResValue}`;
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
        (newModifier) -
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
      const { mystic : {modifier, spellUsed, spellGrade}, combat : {at}, blindnessPen } = this.modalData.defender;
      let atResValue = 0;
      if (at.defense) {atResValue += at.final* 10 + 20 + 10};
      const newModifier = blindnessPen + modifier ?? 0;
      if (spellUsed) {
        this.defenderActor.setFlag('world', `${this.defenderActor._id}.lastDefensiveSpellUsed`, spellUsed);
        const magicProjection =
          this.defenderActor.system.mystic.magicProjection.imbalance.defensive.final
            .value + atResValue;
        const baseMagicProjection =
          this.defenderActor.system.mystic.magicProjection.imbalance.defensive.base.value;

        let formula = `1d100xa + ${magicProjection} + ${newModifier}`;
        if (this.modalData.defender.withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (baseMagicProjection >= 200) {
          // Mastery reduces the fumble range
          formula = formula.replace('xa', 'xamastery');
        }

        const { spells } = this.defenderActor.system.mystic;
        const spell = spells.find(w => w._id === spellUsed);

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
        };

        let unableToDefense = false;
        let dobleDamage = false;
        let cantDamage = false;
        const attackerSpecialType = this.modalData.attacker.specialType;
        const shieldCheck = shieldSupernaturalCheck(spell.name, attackerSpecialType)
        unableToDefense = shieldCheck[0];
        dobleDamage = shieldCheck[1];
        cantDamage = shieldCheck[2];

        const rolled = roll.total - magicProjection - (newModifier);

        this.hooks.onDefense({
          type: 'mystic',
          values: {
            modifier: newModifier,
            magicProjection,
            spellGrade,
            spellUsed,
            at: at.final,
            roll: rolled,
            total: roll.total,
            unableToDefense,
            dobleDamage,
            cantDamage,
            atResValue
          }
        });

        this.modalData.defenseSent = true;

        this.render();
      }
    });

    html.find('.send-psychic-defense').click(() => {
      const { psychic: {psychicPotential, powerUsed, modifier}, combat : {at}, blindnessPen } = this.modalData.defender;
      let atResValue = 0;
      if (at.defense) {atResValue += at.final* 10 + 20 + 10};
      const newModifier = blindnessPen + modifier ?? 0;
      if (powerUsed) {
        this.defenderActor.setFlag('world', `${this.defenderActor._id}.lastDefensivePowerUsed`, powerUsed);
        const psychicProjection = this.defenderActor.system.psychic.psychicProjection.imbalance.defensive.final.value + atResValue;
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
        const powers = this.defenderActor.system.psychic.psychicPowers;
        const power = powers.find(w => w._id === powerUsed);

        if (this.modalData.defender.showRoll) {
          const { i18n } = game;

          const flavor = i18n.format('macros.combat.dialog.psychicDefense.title', {
            power: power.name,
            target: this.modalData.attacker.token.name
          });

          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
            flavor
          });
        };

        let unableToDefense = false;
        const attackerSpecialType = this.modalData.attacker.specialType;
        const shieldCheck = shieldSupernaturalCheck(power.name, attackerSpecialType)
        unableToDefense = shieldCheck[0];

        const rolled = roll.total - psychicProjection - (newModifier);

        this.hooks.onDefense({
          type: 'psychic',
          values: {
            modifier: newModifier,
            powerUsed,
            psychicProjection,
            psychicPotential: psychicPotential.final,
            at: at.final,
            roll: rolled,
            total: roll.total,
            unableToDefense,
            dobleDamage: false,
            cantDamage: false,
            atResValue
          }
        });

        this.modalData.defenseSent = true;

        this.render();
      }
    });
  }

  getData() {
    const { defender: { combat, psychic, mystic}, ui } = this.modalData;
    ui.hasFatiguePoints =
      this.defenderActor.system.characteristics.secondaries.fatigue.value > 0;

    const { psychicPowers } = this.defenderActor.system.psychic;
    if (!psychic.powerUsed) {
        psychic.powerUsed = psychicPowers.filter(w => w.system.combatType.value === "defense")[0]?._id;
    };
    const power = psychicPowers.find(w => w._id === psychic.powerUsed);
    let psychicBonus = power?.system.bonus.value ?? 0
    psychic.psychicPotential.final =
    psychic.psychicPotential.special +
      this.defenderActor.system.psychic.psychicPotential.final.value + psychicBonus;

    const { spells } = this.defenderActor.system.mystic;
    if (!mystic.spellUsed) {
        mystic.spellUsed = spells.filter(w => w.system.combatType.value === "attack")[0]?._id
    };
    const spell = spells.find(w => w._id === mystic.spellUsed);
    mystic.spellPrepared = this.defenderActor.system.mystic.preparedSpells.find(ps => ps.name == spell.name && ps.system.grade.value == mystic.spellGrade)?.system.prepared.value ?? false;
    let actType = 'main';
    mystic.spellInnate = innateCheck(this.defenderActor.system.mystic.act[actType].final.value, this.defenderActor.system.general.advantages, spell?.system.grades[mystic.spellGrade].zeon.value);

    const { weapons } = this.defenderActor.system.combat;
    combat.weapon = weapons.find(w => w._id === combat.weaponUsed);

    return this.modalData;
  }

  async _updateObject(event, formData) {
    this.modalData = mergeObject(this.modalData, formData);

    this.render();
  }
}
