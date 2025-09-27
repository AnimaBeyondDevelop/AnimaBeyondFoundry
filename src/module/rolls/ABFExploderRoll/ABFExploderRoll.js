// ABFExploderRoll/ABFExploderRoll.js
import ABFFoundryRoll from '../ABFFoundryRoll';
import { ABFRoll } from '../ABFRoll';

export default class ABFExploderRoll extends ABFRoll {
  // Public API preserved
  get fumbled() {
    return this.foundryRoll.firstResult <= this.fumbleRange;
  }

  /** @returns {Promise<ABFFoundryRoll>} */
  async evaluate() {
    if (!this.firstDice || !this.firstDice.results?.length) return this.foundryRoll;

    // Reentrancy guard: avoid exploding twice if evaluate() is called again
    if (this.firstDice.__abfExploded) {
      const baseCount = this.firstDice.__baseCount ?? this._getBaseCount();
      const keepCfg = this._parseKeepFromFormula();
      if (keepCfg) this._applyKeepOverGroups(keepCfg, baseCount);
      this._markFumblesBaseOnly(); // UI: fumbles only on base dice
      this.foundryRoll.recalculateTotal();
      return this.foundryRoll;
    }
    this.firstDice.__abfExploded = true;

    // Determine base dice count and pre-group engine explosions (from 'x')
    const baseCount = this._getBaseCount();
    this.firstDice.__baseCount = baseCount;
    this._preGroupExistingExplosions(baseCount);

    // Keep original index for stable ordering
    this.firstDice.results.forEach((r, i) => (r.__origIndex = i));

    // Open-chain per base group (threshold increases +1 per explosion)
    for (let i = 0; i < baseCount; i++) {
      await this._explodeChainFromIndex(i);
    }

    // Order for display: group → chain → original index
    this._orderResultsForDisplay();

    // Clean flags and apply keep-high/keep-low over grouped chains
    for (const r of this.firstDice.results) {
      r.discarded = false;
      r.active = true;
      if (r.count === 0) r.count = 1;
    }
    const keepCfg = this._parseKeepFromFormula();
    if (keepCfg) this._applyKeepOverGroups(keepCfg, baseCount);

    // UI: only base dice (chainIndex 0) can be fumbles; exploded extras never
    this._markFumblesBaseOnly();

    this.foundryRoll.recalculateTotal();
    return this.foundryRoll;
  }

  /**
   * Continue an open-roll chain starting from the last result of group `index`.
   * Starts threshold at openRollRange + existingExplosions (capped at 100).
   */
  async _explodeChainFromIndex(index) {
    if (!this.firstDice) return;

    let currentObj = this._lastInGroup(index);
    let threshold = Math.min(this.openRollRange + (this._groupSize(index) - 1), 100);

    while (true) {
      // Doubles: if matched, count the triggering result as 100
      const explodedByDoubles = this.openOnDoubles
        ? await this._applyDoublesRule(currentObj)
        : false;

      // Threshold rule (>= threshold)
      const meetsThreshold = currentObj.result >= threshold;

      if (!(meetsThreshold || explodedByDoubles)) break;

      // Mark for UI
      currentObj.success = true;
      currentObj.exploded = true;

      // Roll extra 1d100 and append to the same group/chain
      const extra = new ABFFoundryRoll('1d100');
      await extra.evaluate();
      this.addRoll(extra);

      const last = this.firstDice.results[this.firstDice.results.length - 1];
      last.__group = index;
      last.__chainIndex = (currentObj.__chainIndex ?? 0) + 1; // next in chain
      last.__origIndex = this.firstDice.results.length - 1; // fallback stable

      threshold = Math.min(threshold + 1, 100);
      currentObj = last;
    }
  }

  /**
   * If doubles rule applies (value is 11,22,...,99 and d10 matches), treat as 100.
   */
  async _applyDoublesRule(obj) {
    const v = obj.result;
    if (v % 11 !== 0) return false;

    const d10 = new ABFFoundryRoll('1d10');
    await d10.evaluate();

    const ok = d10.total === v / 11;
    if (ok) {
      obj.__originalResult = v; // for UI/debug
      obj.__doublesAs100 = true; // marker
      obj.result = 100; // counts as 100
    }
    return ok;
  }

  /**
   * Parse kh/kl (optionally numbered) from the user formula, then normalized, then dice modifiers.
   * Supports xakh, xakl2, kh3, kl, etc.
   */
  _parseKeepFromFormula() {
    const scan = s => {
      if (!s) return null;
      const f = String(s).replace(/\s+/g, '').toLowerCase();
      let m = f.match(/xa?k([hl])(\d+)?/); // xakh / xaklN
      if (!m) m = f.match(/k([hl])(\d+)?/); // khN / klN
      if (!m) return null;
      const mode = m[1]; // 'h'|'l'
      const count = m[2] ? Math.max(1, parseInt(m[2], 10)) : 1;
      return { mode, count };
    };

    // Prefer original user formula
    let res = scan(this.foundryRoll?._formula);
    if (res) return res;

    // Then normalized formula
    res = scan(this.foundryRoll?.formula);
    if (res) return res;

    // Finally, dice term modifiers
    const mods = (this.firstDice?.modifiers ?? []).join('');
    return scan(mods);
  }

  /**
   * Apply keep-high / keep-low over group sums.
   * Non-kept groups are visually kept but do not contribute to total.
   */
  _applyKeepOverGroups(keepCfg, baseCount) {
    const { mode, count } = keepCfg;
    const groups = new Map(); // groupId -> sum

    // Sum per group (firstDice only)
    for (const r of this.firstDice.results) {
      const g = r.__group;
      if (g === undefined) continue;
      groups.set(g, (groups.get(g) ?? 0) + (r.result ?? 0));
    }

    // Decide which groups to keep
    const entries = Array.from(groups.entries()); // [groupId, sum]
    entries.sort((a, b) => (mode === 'h' ? b[1] - a[1] : a[1] - b[1]));
    const keepSet = new Set(entries.slice(0, Math.min(count, baseCount)).map(e => e[0]));

    // Mark non-kept groups as discarded/inactive (do not change result values)
    for (const r of this.firstDice.results) {
      const g = r.__group;
      if (g === undefined) continue;
      if (!keepSet.has(g)) {
        r.discarded = true;
        r.active = false;
        r.count = 0; // optional guard if any summation uses 'count'
      }
    }
  }

  // --------------------- fumble & ordering helpers ---------------------

  /** UI: only base dice (chainIndex 0) can be fumbles; exploded extras never. */
  _markFumblesBaseOnly() {
    for (const r of this.firstDice.results) {
      const isBase = (r.__chainIndex ?? 0) === 0; // base die of its group
      const v = typeof r.result === 'number' ? r.result : null;

      if (isBase && v !== null && v <= this.fumbleRange) {
        r.failure = true; // paint red like a natural 1
        r.success = false; // ensure not success
        r.isMin = true; // optional UI hint
      } else {
        if (r.failure) r.failure = false;
        if (r.isMin) r.isMin = false;
      }
    }
  }

  /** Sort results: group → chain → original index */
  _orderResultsForDisplay() {
    const arr = this.firstDice.results.slice(); // copy
    arr.sort((a, b) => {
      const ga = a.__group ?? 0,
        gb = b.__group ?? 0;
      if (ga !== gb) return ga - gb;
      const ca = a.__chainIndex ?? 0,
        cb = b.__chainIndex ?? 0;
      if (ca !== cb) return ca - cb;
      const oa = a.__origIndex ?? 0,
        ob = b.__origIndex ?? 0;
      return oa - ob;
    });
    this.firstDice.results = arr;
  }

  // --------------------- grouping helpers ---------------------

  /** Get N from NdX: prefer dice term.number, then parse formula, else fallback. */
  _getBaseCount() {
    const n = this.firstDice?.number;
    if (typeof n === 'number' && n > 0) return n;
    const src = this.foundryRoll?._formula || this.foundryRoll?.formula || '';
    const m = /(\d+)\s*d\s*\d+/i.exec(src);
    return m ? parseInt(m[1], 10) : this.firstDice.results?.length || 1;
  }

  /**
   * Pre-group existing engine explosions created by 'x' (explode on max = 100).
   * Assigns a group id and chain index to each base result and to its immediate engine-generated extras.
   */
  _preGroupExistingExplosions(baseCount) {
    const arr = this.firstDice.results;

    // Clear previous tags
    for (const r of arr) {
      delete r.__group;
      delete r.__chainIndex;
    }

    let i = 0;
    for (let g = 0; g < baseCount && i < arr.length; g++) {
      // Base
      arr[i].__group = g;
      arr[i].__chainIndex = 0;

      // Attach contiguous engine extras caused by a preceding 100
      while (
        i + 1 < arr.length &&
        arr[i].result === 100 &&
        arr[i + 1].__group === undefined
      ) {
        i++;
        arr[i].__group = g;
        arr[i].__chainIndex = (arr[i - 1].__chainIndex ?? 0) + 1;
        // Continues if extra was also 100 (100,100,73...)
      }
      i++;
    }
  }

  _groupSize(groupId) {
    let c = 0;
    for (const r of this.firstDice.results) if (r.__group === groupId) c++;
    return c;
  }

  _lastInGroup(groupId) {
    let last = null;
    for (const r of this.firstDice.results) if (r.__group === groupId) last = r;
    return last ?? this.firstDice.results[groupId];
  }
}
