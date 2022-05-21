import ABFFoundryRoll from '../ABFFoundryRoll';
import { ABFRoll } from '../ABFRoll';

export default class ABFExploderRoll extends ABFRoll {
  private lastOpenRange = this.openRollRange;
  
  get canExplode() {
    const lastResult = this.firstDice.results[this.firstDice.results.length-1]
    if (this.openOnDoubles) {
      if (this.checkDoubles()) return true;
    }
    let exploded = lastResult.result >= this.lastOpenRange;
    lastResult.success = exploded;
    return exploded;
  }

  get fumbled() {
    return this.foundryRoll.firstResult <= this.fumbleRange;
  }

  protected checkDoubles(): boolean {
    if (this.foundryRoll.lastResult % 11 === 0) {
      const newRoll = new ABFFoundryRoll('1d10').evaluate();

      if (newRoll.total === (this.foundryRoll.lastResult / 11)) {
        this.firstDice.results[this.firstDice.results.length-1] = {
          ...this.firstDice.results[this.firstDice.results.length-1],
          success: true,
          exploded: true,
          count: 100
        }
        return true;
      }
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
    this.lastOpenRange = Math.min(openRange, 100);
    console.log(this.firstDice);

    const newRoll = new ABFFoundryRoll('1d100').evaluate();
    const newResult = this.addRoll(newRoll);

    if (this.canExplode) {
      this.explodeDice(openRange + 1);
    }
  }
}
