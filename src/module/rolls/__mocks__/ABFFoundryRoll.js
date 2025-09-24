// ABFExploderRoll/ABFExploderRoll.js
import ABFFoundryRoll from '../ABFFoundryRoll';
import { ABFRoll } from '../ABFRoll';

export default class ABFExploderRoll extends ABFRoll {
  // Keep for backward compatibility, not used by the new flow
  lastOpenRange = this.openRollRange;

  get fumbled() {
    // Preserve previous public API
    return this.foundryRoll.firstResult <= this.fumbleRange;
  }

  /** Check "open on doubles" rule (optional setting) */
  async checkDoubles(result) {
    if (result % 11 !== 0) return false;
    const d10 = new ABFFoundryRoll('1d10');
    await d10.evaluate();
    return d10.total === result / 11;
  }

  /** @returns {Promise<ABFFoundryRoll>} */
  async evaluate() {
    // Mark fumble only on the very first base die (same behavior as before)
    if (this.firstDice?.results?.length > 0) {
      this.firstDice.results[0].failure =
        this.firstDice.results[0].result <= this.fumbleRange;
    }

    // Number of base dice in the term (e.g., 2 for "2d100")
    const baseCount = this.firstDice?.results?.length ?? 0;

    // Process each base result independently and append its own open chain
    for (let i = 0; i < baseCount; i++) {
      await this._explodeChainFromIndex(i);
    }

    // Recalculate total if the wrapper provides it (used in tests/custom roll)
    if (typeof this.foundryRoll.recalculateTotal === 'function') {
      this.foundryRoll.recalculateTotal();
    }

    return this.foundryRoll;
  }

  /**
   * Explode chain starting from base result at `index`.
   * Uses openRollRange threshold, increasing by +1 per explosion (capped at 100).
   */
  async _explodeChainFromIndex(index) {
    if (!this.firstDice || !this.firstDice.results?.[index]) return;

    let threshold = this.openRollRange;
    // Pointer to the current (last) result object in this chain
    let currentObj = this.firstDice.results[index];

    // Keep exploding as long as we meet threshold or pass the doubles rule
    // Note: we check doubles on each link in the chain if the setting is enabled.
    //       If both conditions pass, it still only produces a single extra die per loop.
    while (
      currentObj.result >= threshold ||
      (this.openOnDoubles && (await this.checkDoubles(currentObj.result)))
    ) {
      // Mark for UI (flags already used in your codebase)
      currentObj.success = true;
      currentObj.exploded = true;

      // Roll extra 1d100 and append it to the same Die (same chain)
      const extra = new ABFFoundryRoll('1d100');
      await extra.evaluate();
      this.addRoll(extra);

      // Move pointer to the brand-new last result we just appended
      currentObj = this.firstDice.results[this.firstDice.results.length - 1];

      // Raise threshold for subsequent explosions in this chain
      threshold = Math.min(threshold + 1, 100);
    }
  }

  // -------------------------------------------------------------------------
  // Legacy helpers kept for compatibility (not used by the new evaluate flow)
  // -------------------------------------------------------------------------

  /** @deprecated Legacy single-chain check against the last result */
  async canExplode() {
    if (!this.firstDice?.results?.length) return false;
    const lastResult = this.firstDice.results[this.firstDice.results.length - 1];

    if (this.openOnDoubles && lastResult.result % 11 === 0) {
      const newRoll = new ABFFoundryRoll('1d10');
      await newRoll.evaluate();
      if (newRoll.total === lastResult.result / 11) {
        lastResult.success = true;
        lastResult.exploded = true;
        lastResult.count = 100;
        return true;
      }
    }

    const exploded = lastResult.result >= this.openRollRange;
    lastResult.success = exploded;
    return exploded;
  }

  /** @deprecated Legacy recursive single-chain exploder */
  async explodeDice(openRange) {
    this.lastOpenRange = Math.min(openRange, 100);
    const newRoll = new ABFFoundryRoll('1d100');
    await newRoll.evaluate();
    this.addRoll(newRoll);
    if (await this.canExplode()) {
      await this.explodeDice(openRange + 1);
    }
  }
}
