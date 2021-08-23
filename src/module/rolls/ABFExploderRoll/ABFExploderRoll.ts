import ABFFoundryRoll from '../ABFFoundryRoll';
import { ABFRoll } from '../ABFRoll';

export default class ABFExploderRoll extends ABFRoll {
  private readonly DEFAULT_OPEN_RANGE = 90;

  get canExplode() {
    return this.foundryRoll.firstResult >= this.DEFAULT_OPEN_RANGE;
  }

  public evaluate(): ABFFoundryRoll {
    let lastOpenRange = this.DEFAULT_OPEN_RANGE;

    if (this.canExplode) {
      lastOpenRange = this.explodeDice(this.DEFAULT_OPEN_RANGE);
    }

    this.firstDice.results = this.firstDice.results.map(res => ({
      ...res,
      success: res.result >= lastOpenRange,
      failure: res.result <= this.DEFAULT_FUMBLE_RANGE
    }));

    return this.foundryRoll;
  }

  private explodeDice(openRange: number): number {
    const newRoll = new ABFFoundryRoll('1d100').evaluate();
    const newResult = this.addRoll(newRoll);

    if (newResult >= Math.min(openRange, 100)) {
      this.explodeDice(openRange + 1);
    }

    return openRange;
  }
}
