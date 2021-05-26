import ABFExploderRoll from './ABFExploderRoll/ABFExploderRoll';
import { ABFRoll } from './ABFRoll';
import ABFInitiativeRoll from './ABFInitiativeRoll/ABFInitiativeRoll';

/**
 * This class represents the entrypoint of Foundry
 * We must never add our logic here, all of it must be placed in its own class like ABFExploredRoll
 */
export default class ABFFoundryRoll extends Roll {
  private readonly abfRoll: ABFRoll | undefined;

  _formula: string;
  data: Record<string, unknown>;

  terms: DicePool[];

  constructor(formula: string, data?: Record<string, unknown>) {
    super(formula, data);

    if (this.formula.includes('xa')) {
      this.abfRoll = new ABFExploderRoll(this);
    }

    if (this.formula.includes('Turno')) {
      this.abfRoll = new ABFInitiativeRoll(this);
    }
  }

  get firstResult() {
    return this.getResults()[0];
  }

  recalculateTotal(mod = 0) {
    this._total = this.getResults().reduce((prev, curr) => prev + curr) + mod;
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
