import ABFRollProxy from './ABFRollProxy';

export default class ABFRoll extends Roll {
  private readonly abfRoll: ABFRollProxy;

  _formula: string;
  data: {};

  terms: DicePool[];

  constructor(formula: string, data?: {}) {
    super(formula, data);

    this.abfRoll = new ABFRollProxy(this);
  }

  recalculateTotal() {
    this._total = this.getResults().reduce((prev, curr) => prev + curr);
  }

  getResults(): number[] {
    return this.results.filter(res => typeof res === 'number') as number[];
  }

  evaluate({ minimize = false, maximize = false } = {}): this {
    super.evaluate();

    this.abfRoll.evaluate({ minimize, maximize });

    return this;
  }
}
