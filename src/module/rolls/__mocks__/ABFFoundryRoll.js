import { nextValueService } from './nextValueService';

const defaultSettings = {
  openOnDoubles: { value: false },
  openRolls: { value: 90 },
  fumbles: { value: 3 }
};

const getDiceCount = formula => {
  const match = String(formula ?? '').match(/^(\d+)d/i);
  return Number(match?.[1] ?? 1);
};

export default class ABFFoundryRoll {
  constructor(formula, data = {}) {
    this._formula = formula;
    this.formula = formula;
    this.data = {
      general: {
        settings: defaultSettings
      },
      ...data
    };
    this.dice = [
      {
        number: getDiceCount(formula),
        results: []
      }
    ];
    this._total = 0;
  }

  get total() {
    return this._total;
  }

  get firstResult() {
    return this.getResults()[0];
  }

  get lastResult() {
    const results = this.getResults();
    return results[results.length - 1];
  }

  evaluate() {
    if (this.dice[0].results.length === 0) {
      this.dice[0].results.push({
        result: Number(nextValueService.getNextValue() ?? 0),
        active: true
      });
    }

    this.recalculateTotal();
    return this;
  }

  getResults() {
    return this.dice[0].results
      .filter(res => !(res?.discarded || res?.active === false || (res?.count ?? 1) === 0))
      .map(res => Number(res.result ?? 0) * Number(res.count ?? 1));
  }

  recalculateTotal(mod = 0) {
    this._total = this.getResults().reduce((sum, value) => sum + value, 0) + mod;
  }

  overrideTotal(newTotal = 0) {
    this._total = newTotal;
  }
}
