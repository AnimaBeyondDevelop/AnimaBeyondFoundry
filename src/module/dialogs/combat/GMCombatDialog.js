import { Templates } from '../../utils/constants';
import { calculateCombatResult } from '../../combat/utils/calculateCombatResult';
import { calculateATReductionByQuality } from '../../combat/utils/calculateATReductionByQuality';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll.js';

const getInitialData = (attacker, defender, options = {}) => {
  const attackerActor = attacker.actor;
  const defenderActor = defender.actor;

  return {
    ui: {
      isCounter: options.isCounter ?? false
    },
    attacker: {
      token: attacker,
      actor: attackerActor,
      customModifier: 0,
      counterAttackBonus: options.counterAttackBonus,
      isReady: false
    },
    defender: {
      token: defender,
      actor: defenderActor,
      customModifier: 0,
      isReady: false
    }
  };
};

export class GMCombatDialog extends FormApplication {
  constructor(attacker, defender, hooks, options = {}) {
    super(getInitialData(attacker, defender, options));

    this.modalData = getInitialData(attacker, defender, options);

    this.hooks = hooks;

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['abf-dialog gm-combat-dialog'],
      submitOnChange: true,
      closeOnSubmit: false,
      height: 600,
      width: 700,
      template: 'systems/animabf/templates/dialog/combat/gm-combat-dialog.hbs',
      title: 'GM Combat'
    });
  }

  get attackerActor() {
    return this.modalData.attacker.token.actor;
  }

  get defenderActor() {
    return this.modalData.defender.token.actor;
  }

  get attackerToken() {
    return this.modalData.attacker.token;
  }

  get defenderToken() {
    return this.modalData.defender.token;
  }

  get isDamagingCombat() {
    const { attacker } = this.modalData;

    const isPhysicalDamagingCombat = attacker.result?.type === 'combat' &&
    attacker.result.values.damage !== 0;

    const isMysticDamagingCombat =
      attacker.result?.type === 'mystic' &&
      attacker.result.values.damage !== 0;

    const isPsychicDamagingCombat =
      attacker.result?.type === 'psychic' &&
      attacker.result.values.damage !== 0;

    return isPhysicalDamagingCombat || isMysticDamagingCombat || isPsychicDamagingCombat;
  }

  get canApplyDamage() {
    const { calculations } = this.modalData;

    if (!calculations) return false;
    if (calculations.canCounter) return false;

    const attackOverpassDefense = calculations.difference > 0;

    const hasDamage = calculations.damage !== undefined && calculations?.damage > 0;

    return this.isDamagingCombat && attackOverpassDefense && hasDamage;
  }

  async close(options = { executeHook: true }) {
    if (options?.executeHook) {
      await this.hooks.onClose();
    }

    return super.close();
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.cancel-button').click(() => {
      this.applyDamageShieldSupernaturalIfBeAble();
      this.executeMacro(false);
      this.close();
    });

    html.find('.make-counter').click(() => {
      this.applyDamageShieldSupernaturalIfBeAble();
      this.executeMacro(false);
      this.applyValuesIfBeAble();

      if (this.modalData.calculations?.canCounter) {
        this.hooks.onCounterAttack(this.modalData.calculations.counterAttackBonus);
      }
    });

    html.find('.apply-values').click(() => {
      this.applyValuesIfBeAble();

      if (!this.modalData.calculations?.canCounter && this.canApplyDamage) {
        this.defenderActor.applyDamage(this.modalData.calculations.damage);
      }

      this.executeMacro(true);
      this.close();
    });
    html.find('.roll-resistance').click(() => {
      this.applyValuesIfBeAble();
      const resType = this.modalData.attacker.result.values.resistanceType;
      const resCheck = this.modalData.attacker.result.values.resistanceCheck;
      const resistance = this.defenderActor.system.characteristics.secondaries.resistances[resType].base.value;
      let formula = `1d100 + ${resistance ?? 0} - ${resCheck ?? 0}`;
      const resistanceRoll = new ABFFoundryRoll(formula, this.defenderActor.system);
      resistanceRoll.roll();
      const { i18n } = game;
      const flavor = i18n.format('macros.combat.dialog.physicalDefense.resist.title', {
      target: this.modalData.attacker.token.name });
      resistanceRoll.toMessage({
              speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
              flavor
          });
      if (resistanceRoll.total < 0 && this.modalData.attacker.result.values.damage > 0){
      this.defenderActor.applyDamage(this.modalData.attacker.result.values.damage);
      this.executeMacro(true, resistanceRoll.total);
      }
      else{
      this.executeMacro(false, resistanceRoll.total);
      };
      this.close();
  });
    html.find('.show-results').click(async () => {
      const data = {
        attacker: {
          name: this.attackerToken.name,
          img: this.attackerToken.texture.src
        },
        defender: {
          name: this.defenderToken.name,
          img: this.defenderToken.texture.src
        },
        result: this.modalData.calculations?.difference,
        canCounter: this.modalData.calculations?.canCounter
      };

      if (this.modalData.calculations?.canCounter) {
        data.bonus = this.modalData.calculations.counterAttackBonus;
      } else {
        data.damage = this.modalData.calculations?.damage;
      }

      await renderTemplate(Templates.Chat.CombatResult, data).then(content => {
        ChatMessage.create({
          content
        });
      });
    });
  }

  updateAttackerData(result) {
    if (result.values.unableToAttack) {result.values.total = 0};
    result.values.total = Math.max(0, result.values.total);
    this.modalData.attacker.result = result;

    if (result.type === 'combat') {
      const { weapons } = this.attackerActor.system.combat;

      this.modalData.attacker.result.weapon = weapons.find(
        w => w._id === result.values.weaponUsed
      );
    }

    if (result.type === 'mystic') {
      const { spells } = this.attackerActor.system.mystic;

      this.modalData.attacker.result.spell = spells.find(
        w => w._id === result.values.spellUsed
      );
    }

    if (result.type === 'psychic') {
      const powers = this.attackerActor.system.psychic.psychicPowers;

      this.modalData.attacker.result.power = powers.find(
        w => w._id === result.values.powerUsed
      );
    }

    this.render();
  }

  updateDefenderData(result) {
    if (result.values.unableToDefense) {result.values.total = 0};
    result.values.total = Math.max(0, result.values.total);
    this.modalData.defender.result = result;

    if (result.type === 'mystic') {
      const { spells } = this.defenderActor.system.mystic;

      this.modalData.defender.result.spell = spells.find(
        w => w._id === result.values.spellUsed
      );
    }

    if (result.type === 'psychic') {
      const powers = this.defenderActor.system.psychic.psychicPowers;

      this.modalData.defender.result.power = powers.find(
        w => w._id === result.values.powerUsed
      );
    }

    this.render();
  }

  getData() {
    const { attacker, defender } = this.modalData;

    attacker.isReady = !!attacker.result;

    defender.isReady = !!defender.result;

    if (attacker.result && defender.result) {
      const attackerTotal =
        attacker.result.values.total + this.modalData.attacker.customModifier;
      const defenderTotal =
        defender.result.values.total + this.modalData.defender.customModifier - defender.result.values.atResValue;

      const winner = attackerTotal > defenderTotal ? attacker.token : defender.token;

      if (this.isDamagingCombat) {
        const combatResult = calculateCombatResult(
          Math.max(attackerTotal, 0),
          Math.max(defenderTotal, 0),
          Math.max(
            defender.result.values.at - calculateATReductionByQuality(attacker.result),
            0
          ),
          attacker.result.values.damage,
          defender.result.type === 'resistance' ? defender.result.values.surprised : false
        );
        const {distance} = attacker.result.values;
        if (combatResult.canCounterAttack && distance <= 1 ) {
          this.modalData.calculations = {
            difference: attackerTotal - defenderTotal,
            canCounter: true,
            winner,
            counterAttackBonus: combatResult.counterAttackBonus
          };
        } else {
          this.modalData.calculations = {
            difference: attackerTotal - defenderTotal,
            canCounter: false,
            winner,
            damage: combatResult.damage
          };
        }
      } else {
        this.modalData.calculations = {
          difference: attackerTotal - defenderTotal,
          canCounter: false,
          winner
        };
      }
      if (this.modalData.calculations.winner === this.modalData.attacker.token &&
        this.modalData.attacker.result.values.checkResistance === true ) { //Revisar logica a implementar para nuevo dialogo
      }
        else {this.modalData.attacker.result.values.checkResistance = false;}
    }

    return this.modalData;
  }

  async _updateObject(event, formData) {
    this.modalData = mergeObject(this.modalData, formData);

    this.render();
  }

  applyValuesIfBeAble() {
    if (this.modalData.attacker.result?.type === 'combat') {
      this.attackerActor.applyFatigue(this.modalData.attacker.result.values.fatigueUsed);
    }

    if (this.modalData.defender.result?.type === 'combat') {
      this.defenderActor.applyFatigue(this.modalData.defender.result.values.fatigue);
    }
  }

applyDamageShieldSupernaturalIfBeAble() {
  const cantDamage = this.modalData.defender.result?.values.cantDamage;
  const dobleDamage = this.modalData.defender.result?.values.dobleDamage;
  const defenderIsWinner = this.modalData.calculations.winner == this.modalData.defender.token;
  const damage = this.modalData.attacker.result?.values.damage;
  if (defenderIsWinner && (this.modalData.defender.result?.type === 'mystic' || this.modalData.defender.result?.type === 'psychic') && !cantDamage) {
      this.defenderActor.applyDamageShieldSupernatural(damage, dobleDamage);
  }
}
executeMacro(damage, resistanceRoll) {
  let macroName;
  const defenderIsWinner = this.modalData.calculations.winner == this.modalData.defender.token
  let args = {
      attacker: this.attackerToken,
      defender: this.defenderToken,
      defenderIsWinner,
      dodge: false,
      totalAtk: this.modalData.attacker.result.values.total,
      damage,
      blood: 'red',
      missvalue: 80,
      invisible: false,
      resistanceRoll,
      spellGrade: this.modalData.attacker.result.values.spellGrade
      };
  if (this.modalData.attacker.result?.type === 'combat') {
      const {name} = this.modalData.attacker.result.weapon
      macroName = `Atk ${name}`;
      const {projectile} = this.modalData.attacker.result.values
      if (projectile) {
          args = {...args, projectile: projectile};
          if (projectile.type == 'shot') {macroName = 'Atk Projectil Flecha'}
      }
  }
  else if (this.modalData.attacker.result?.type === 'mystic'){
      macroName = this.modalData.attacker.result.values.spellName;
  }
  else if (this.modalData.attacker.result?.type === 'psychic'){
      macroName = this.modalData.attacker.result.values.powerName;
  };
  if (this.modalData.defender.result?.type === 'combat') {
      const {type} = this.modalData.defender.result.values
      if (type == 'dodge') {
          args.dodge = true
      }
  };
  if (this.modalData.attacker.result.values.visible !== undefined && 
      !this.modalData.attacker.result.values.visible){
      args.invisible = true
  };
  
  if (this.modalData.attacker.result?.values.macro !== undefined &&
      this.modalData.attacker.result?.values.macro !== '') {
      macroName = this.modalData.attacker.result?.values.macro
  };
  console.log(args)
  const macro = game.macros.getName(macroName);
  if (macro) {
      macro.execute(args)
    } else {
      console.error(`Macro '${macroName}' not found.`);
    }
  }
}