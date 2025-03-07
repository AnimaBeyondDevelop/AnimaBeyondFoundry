import { CombatResultsCalculator } from './CombatResultsCalculator.svelte';

/**
 * @class
 * @extends CombatResultsCalculator
 */
export class CombatResults extends CombatResultsCalculator {
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
}
