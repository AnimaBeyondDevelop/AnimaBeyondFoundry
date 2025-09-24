// ABFExploderRoll/ABFExploderRoll.js
import ABFFoundryRoll from '../ABFFoundryRoll';
import { ABFRoll } from '../ABFRoll';

export default class ABFExploderRoll extends ABFRoll {
  // Expose same API as before
  get fumbled() {
    return this.foundryRoll.firstResult <= this.fumbleRange;
  }

  /** @returns {Promise<ABFFoundryRoll>} */
  async evaluate() {
    // Safety: ensure there is at least one result
    if (!this.firstDice || !this.firstDice.results?.length) return this.foundryRoll;

    // Fumble only on the first base die (same behavior as before)
    this.firstDice.results[0].failure =
      this.firstDice.results[0].result <= this.fumbleRange;

    // Snapshot of base results count (e.g., 2 for "2d100")
    const baseCount = this.firstDice.results.length;

    // Process each base result independently
    for (let i = 0; i < baseCount; i++) {
      await this._explodeChainFromIndex(i);
    }

    // Sum again after appending extra dice
    this.foundryRoll.recalculateTotal();
    return this.foundryRoll;
  }

  /**
   * Start an open-roll chain from the base result at `index`.
   * Uses openRollRange and increases it by +1 per explosion (capped at 100).
   */
  async _explodeChainFromIndex(index) {
    let threshold = this.openRollRange;
    let currentObj = this.firstDice.results[index];

    while (
      currentObj.result >= threshold ||
      (this.openOnDoubles && (await this._checkDoubles(currentObj.result)))
    ) {
      // Mark the triggering result for UI
      currentObj.success = true;
      currentObj.exploded = true;

      // Roll extra 1d100 and append to the same Die (same chain)
      const extra = new ABFFoundryRoll('1d100');
      await extra.evaluate();
      this.addRoll(extra);

      // Next link in the chain: raise threshold and point to the new last result
      threshold = Math.min(threshold + 1, 100);
      currentObj = this.firstDice.results[this.firstDice.results.length - 1];
    }
  }

  /** Optional "open on doubles" rule: roll 1d10 and compare to the repeated digit */
  async _checkDoubles(value) {
    if (value % 11 !== 0) return false;
    const d10 = new ABFFoundryRoll('1d10');
    await d10.evaluate();
    return d10.total === value / 11;
  }
}
