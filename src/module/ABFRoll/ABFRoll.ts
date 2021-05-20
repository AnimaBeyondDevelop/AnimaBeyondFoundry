import ABFRollProxy from './ABFRollProxy';

export default class ABFRoll extends Roll {
  private readonly abfRoll: ABFRollProxy;

  constructor(formula: string, data?: {}) {
    super(formula, data);

    this.abfRoll = new ABFRollProxy(this);
  }

  evaluate({ minimize = false, maximize = false } = {}): this {
    super.evaluate();

    this.abfRoll.evaluate({ minimize, maximize });

    return this;
  }
}
