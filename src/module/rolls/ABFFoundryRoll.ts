import type { Options } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/roll';
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

  terms: RollTerm[];

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
    return this.dice[0].results.map(res => res.result);
  }

  // TODO Evaluate not finished this | Promise<this>
  evaluate(options?: Partial<Options>): any {
    super.evaluate();

    this.abfRoll?.evaluate(options);

    return this;
  }
}
