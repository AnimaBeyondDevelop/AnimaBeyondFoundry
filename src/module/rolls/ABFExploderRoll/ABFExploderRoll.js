import ABFFoundryRoll from '../ABFFoundryRoll';
import { ABFRoll } from '../ABFRoll';

export default class ABFExploderRoll extends ABFRoll {
  lastOpenRange = this.openRollRange;

  get canExplode() {
    const lastResult = this.firstDice.results[this.firstDice.results.length - 1];
    if (this.openOnDoubles && this.checkDoubles(lastResult.result)) {
      this.firstDice.results[this.firstDice.results.length - 1] = {
        ...lastResult,
        success: true,
        exploded: true,
        count: 100
      };
      return true;
    }
    let exploded = lastResult.result >= this.lastOpenRange;
    lastResult.success = exploded;
    return exploded;
  }

  get fumbled() {
    return this.foundryRoll.firstResult <= this.fumbleRange;
  }

  /** @param {number} result */
  checkDoubles(result) {
    if (result % 11 === 0) {
      const newRoll = new ABFFoundryRoll('1d10').evaluate();

      return newRoll.total === result / 11;
    }
    return false;
  }

  evaluate() {
    if (this.canExplode) {
      this.explodeDice(this.lastOpenRange + 1);
    }

    this.firstDice.results[0].failure =
      this.firstDice.results[0].result <= this.fumbleRange;

    this.foundryRoll.recalculateTotal();

    return this.foundryRoll;
  }

  /** @param {number} result */
  explodeDice(openRange) {
    this.lastOpenRange = Math.min(openRange, 100);

    const newRoll = new ABFFoundryRoll('1d100').evaluate();
    const newResult = this.addRoll(newRoll);

    if (this.canExplode) {
      this.explodeDice(openRange + 1);
    }
  }
}
