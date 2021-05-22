import ABFExploderRoll from './ABFExploderRoll/ABFExploderRoll';

export default class ABFFoundryRoll extends Roll {
  private readonly abfRoll: ABFExploderRoll | undefined;

  _formula: string;
  data: {};

  terms: DicePool[];

  constructor(formula: string, data?: {}) {
    super(formula, data);

    if (this.formula.includes('xa')) {
      this.abfRoll = new ABFExploderRoll(this);
    }
  }

  recalculateTotal() {
    this._total = this.getResults().reduce((prev, curr) => prev + curr);
  }

  getResults(): number[] {
    return this.results.filter(res => typeof res === 'number') as number[];
  }

  evaluate({ minimize = false, maximize = false } = {}): this {
    super.evaluate();

    this.abfRoll?.evaluate({ minimize, maximize });

    return this;
  }
}
