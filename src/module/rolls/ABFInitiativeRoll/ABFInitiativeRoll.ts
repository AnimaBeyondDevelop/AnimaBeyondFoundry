import ABFFoundryRoll from '../ABFFoundryRoll';
import ABFExploderRoll from '../ABFExploderRoll/ABFExploderRoll';

export default class ABFInitiativeRoll extends ABFExploderRoll {
  public evaluate(): ABFFoundryRoll {
    console.log(this.fumbled)
    super.evaluate();

    console.log(this.fumbled)
    if (this.fumbled) {
      this.foundryRoll.recalculateTotal(this.calculateFumbledInitiativeMod());
    }

    return this.foundryRoll;
  }

  private calculateFumbledInitiativeMod(): number {
    if (this.foundryRoll.firstResult === 1) return -125;
    if (this.foundryRoll.firstResult === 2) return -100;
    if (this.foundryRoll.firstResult <= this.fumbleRange) return -75;

    return 0;
  }
}
