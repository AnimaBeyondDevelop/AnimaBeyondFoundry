/**
 * Custom implementation of Roll from foundry.js
 * Test methods are unique methods used for unit testing
 */
export default class ABFFoundryRoll {
  _formula: string;
  data: Record<string, unknown> | undefined;

  _rolled = false;
  _total: number;

  results: (number | string)[];
  terms: DicePool[];

  // Test variable
  static nextValue: number | null;

  constructor(formula: string, data?: Record<string, unknown>) {
    this._formula = formula;
    this.data = data;

    this.results = [];
    this.terms = [];
  }

  // eslint-disable-next-line class-methods-use-this
  setNextValue(nextValue: number) {
    ABFFoundryRoll.nextValue = nextValue;
  }

  recalculateTotal(mod = 0) {
    this._total = this.getResults().reduce((prev, curr) => prev + curr) + mod;
  }

  get total() {
    return this._total;
  }

  get firstResult() {
    return this.getResults()[0];
  }

  getResults(): number[] {
    return this.results.map(res => parseInt(res.toString(), 10));
  }

  evaluate() {
    if (this._rolled) throw new Error('Already rolled');

    const value =
      ABFFoundryRoll.nextValue ?? Math.min(1, Math.floor(Math.random() * 100));
    const result = { result: value, active: true } as DiceTerm.Result;
    const results = { results: [result] } as DicePool;

    this.results.push(value);
    this.terms.push(results);

    this._total = this.getResults().reduce((val, curr) => val + curr);
    this._rolled = true;
    ABFFoundryRoll.nextValue = null;

    return this;
  }
}
