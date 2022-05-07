import ABFFoundryRoll from '../ABFFoundryRoll';
import { ABFRoll } from '../ABFRoll';

export default class ABFExploderRoll extends ABFRoll {
  private lastOpenRange = this.openRollRange;
  
  get canExplode() {
    return this.foundryRoll.lastResult >= this.openRollRange;
  }

  get fumbled() {
    return this.foundryRoll.firstResult <= this.fumbleRange;
  }

  public evaluate(): ABFFoundryRoll {
    if (this.canExplode) {
      this.explodeDice(this.lastOpenRange + 1);
    }

    this.firstDice.results = this.firstDice.results.map(res => ({
      ...res,
      success: res.result >= this.lastOpenRange,
      failure: res.result <= this.fumbleRange
    }));

    this.foundryRoll.recalculateTotal();

    return this.foundryRoll;
  }

  private explodeDice(openRange: number) {
    this.lastOpenRange = openRange;

    const newRoll = new ABFFoundryRoll('1d100').evaluate();
    const newResult = this.addRoll(newRoll);

    if (newResult >= Math.min(openRange, 100)) {
      this.explodeDice(openRange + 1);
    }
  }
}
