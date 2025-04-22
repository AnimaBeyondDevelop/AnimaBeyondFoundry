import { PhysicDefense } from '../defense';
import { CombatResultsCalculator } from './CombatResultsCalculator.svelte';
import { ABFSettingsKeys } from '@utils/registerSettings';
import { executeMacro } from '@module/utils/functions/executeMacro';
import { PhysicAttack } from '@module/combat/attack';

/**
 * @class
 * @extends CombatResultsCalculator
 */
export class CombatResults extends CombatResultsCalculator {
  supernaturalShieldDamageMultiplier = $state(1);

  /**
   * @param {import('../attack').Attack} attack
   * @param {import('../defense').Defense} defense
   */
  constructor(attack, defense) {
    super(attack, defense);

    this.attack = attack;
    this.defense = defense;
  }

  get canCounterAttack() {
    return super.canCounterAttack && this.attack.meleeCombat;
  }

  get winner() {
    return this.totalDifference > 0
      ? this.attack.attackerToken.name
      : this.defense.defenderToken.name;
  }

  get supernaturalShieldDamage() {
    if (this.defense instanceof PhysicDefense || this.totalDifference > 0) return;
    return this.supernaturalShieldDamageMultiplier === 0
      ? 0
      : this.baseDamage * this.supernaturalShieldDamageMultiplier +
          this.attack.atReduction * 10;
  }

  get postShieldDamage() {
    if (this.defense instanceof PhysicDefense || this.totalDifference > 0) return;
    let newShieldPoints =
      this.defense.supernaturalShield.system.shieldPoints - this.supernaturalShieldDamage;
    if (newShieldPoints > 0) return;
    return Math.max(
      (Math.abs(newShieldPoints) - this.attack.atReduction * 10) /
        this.supernaturalShieldDamageMultiplier,
      0
    );
  }

  get damage() {
    if (!this.postShieldDamage) {
      return super.damage;
    }
    return new CombatResultsCalculator(
      {
        finalAbility: this.attack.finalAbility,
        finalDamage: this.postShieldDamage,
        halvedAbsorption: this.attack.halvedAbsorption,
        atReduction: this.attack.atReduction
      },
      {
        finalAbility: 0,
        finalAt: this.defense.finalAt,
        halvedAbsorption: this.defense.halvedAbsorption
      }
    ).damage;
  }

  apply() {
    this.executeCombatMacro();
    this.defense.defender.applyDamage(this.damage);
    this.attack.onApply(this);
    this.defense.onApply(this);
    this.attack.attacker.setLastTypeOfAttackUsed(this.attack.type);
    this.defense.defender.setLastTypeOfDefenseUsed(this.defense.type);
  }

  executeCombatMacro() {
    const missedAttackValue = game.settings.get(
      'animabf',
      ABFSettingsKeys.MACRO_MISS_ATTACK_VALUE
    );
    const macroPrefixAttack = game.settings.get(
      'animabf',
      ABFSettingsKeys.MACRO_PREFIX_ATTACK
    );
    const { attacker, attackerToken, critic } = this.attack;
    const { defender, defenderToken } = this.defense;
    const winner = this.totalDifference > 0 ? 'attacker' : 'defender';
    let macroName = this.attack.displayName;
    let args = {
      attacker: attackerToken,
      spellGrade: this.attack.spellGrade,
      psychicPotential: this.attack.potential?.final,
      projectile: {
        value: !(this.attack instanceof PhysicAttack) || this.attack.isRanged
      },
      defenders: [
        {
          defender: defenderToken,
          winner,
          defenseType:
            this.defense.type === 'physic'
              ? this.defense.physicDefenseType
              : this.defense.type,
          totalAttack: this.attack.finalAbility,
          appliedDamage: this.damage,
          damageType: critic,
          bloodColor: 'red', // add bloodColor to actor template
          missedAttack: false,
          resistanceRoll: 0, // add the total value of the roll when implemented
          criticImpact: 0
        }
      ]
    };
    if (args.defenders[0].totalAttack < missedAttackValue && winner === 'defender') {
      args.defenders[0].missedAttack = true;
    }

    if (this.attack.type === 'physic') {
      macroName = macroPrefixAttack + macroName;
    }

    executeMacro(macroName, args);
  }
}
