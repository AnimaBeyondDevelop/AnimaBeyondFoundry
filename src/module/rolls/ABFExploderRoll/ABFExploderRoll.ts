import ABFFoundryRoll from '../ABFFoundryRoll';
import { ABFRoll } from '../ABFRoll';

export default class ABFExploderRoll extends ABFRoll {
  private lastOpenRange = this.openRollRange;
  private success = false
  
  get canExplode() {
    const lastResult = this.firstDice.results[this.firstDice.results.length-1]
    if (this.openOnDoubles && this.checkDoubles(lastResult.result)) {
      this.firstDice.results[this.firstDice.results.length-1] = {
        ...lastResult,
        success: true,
        exploded: true,
        count: 100
      }
      return true;
    }
    let exploded = lastResult.result >= this.lastOpenRange;
    lastResult.success = exploded;
    return exploded;
  }

  get fumbled() {
    return this.foundryRoll.firstResult <= this.fumbleRange;
  }

  protected checkDoubles(result: number): boolean {
    if (result % 11 === 0) {
      const newRoll = new ABFFoundryRoll('1d10').evaluate();

      return (newRoll.total === (result / 11)) 
    }
    return false;
  }

  public evaluate(): ABFFoundryRoll {
    if (this.canExplode) {
      this.explodeDice(this.lastOpenRange + 1);
    }

    this.firstDice.results[0].failure = 
      this.firstDice.results[0].result <= this.fumbleRange

    this.foundryRoll.recalculateTotal();

    return this.foundryRoll;
  }

  private explodeDice(openRange: number) {
    this.success = true
    this.lastOpenRange = Math.min(openRange, 100);

    const newRoll = new ABFFoundryRoll('1d100').evaluate();
    const newResult = this.addRoll(newRoll);

    if (this.canExplode) {
      this.explodeDice(openRange + 1);
    }
  }
}
