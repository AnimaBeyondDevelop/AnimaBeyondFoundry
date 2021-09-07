/**
 * Custom implementation of Roll from foundry.js
 * Test methods are unique methods used for unit testing
 */
import { nextValueService } from './nextValueService';

export default class ABFFoundryRoll {
  _formula: string;
  data: Record<string, unknown> | undefined;

  _rolled = false;
  _total: number;

  dice: DiceTerm[];

  // Test variable
  static nextValue: number | null;

  constructor(formula: string, data?: Record<string, unknown>) {
    this._formula = formula;
    this.data = data;

    this.dice = [];
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

  get lastResult() {
    return this.getResults()[this.getResults().length - 1];
  }

  getResults(): number[] {
    return this.dice.map(d => d.results.map(res => res.result)).flat();
  }

  get firstDice(): DiceTerm {
    return this.dice[0];
  }

  evaluate() {
    if (this._rolled) throw new Error('Already rolled');

    const value = nextValueService.getNextValue() ?? Math.min(1, Math.floor(Math.random() * 100));

    const diceTerm = { results: [{ result: value, active: true }] } as DiceTerm;

    this.dice.push(diceTerm);

    this.recalculateTotal();

    this._rolled = true;
    nextValueService.setNextValue(undefined);

    return this;
  }
}
