import ABFFoundryRoll from '../ABFFoundryRoll';
import ABFExploderRoll from '../ABFExploderRoll/ABFExploderRoll';

export default class ABFInitiativeRoll extends ABFExploderRoll {
  async evaluate() {
    await super.evaluate();

    if (this.fumbled) {
      this.foundryRoll.recalculateTotal(this.calculateFumbledInitiativeMod());
    }
    return new Promise((resolve, reject) => {
      resolve(this.foundryRoll);
    });
  }

  /** @private */
  _getFinalDieResult() {
    const d100 = this.foundryRoll.dice?.[0];
    if (!d100 || !Array.isArray(d100.results)) return null;

    const kept = d100.results.filter(
      r => !r.discarded && r.active !== false && (r.count ?? 1) > 0
    );

    if (!kept.length) return null;

    return kept[0].result;
  }

  /** @private */
  calculateFumbledInitiativeMod() {
    const value = this._getFinalDieResult();
    if (value == null) return 0;

    if (value === 1) return -126;
    if (value === 2) return -102;
    if (value <= this.fumbleRange) return -75 - value;

    return 0;
  }
}
