import ABFFoundryRoll from '../ABFFoundryRoll';
import { ABFRoll } from '../ABFRoll';

export default class ABFExploderRoll extends ABFRoll {
  private readonly DEFAULT_OPEN_RANGE = 90;

  public evaluate(): ABFFoundryRoll {
    const result = this.foundryRoll.results[0];

    if (result >= this.DEFAULT_OPEN_RANGE) {
      this.explodeDice(this.DEFAULT_OPEN_RANGE);
    }

    return this.foundryRoll;
  }

  private explodeDice(openRange: number) {
    const newRoll = new ABFFoundryRoll(`1d100`).evaluate();
    const newResult = this.addRoll(newRoll);

    if (newResult >= Math.min(openRange, 100)) {
      this.explodeDice(openRange + 1);
    }
  }
}
