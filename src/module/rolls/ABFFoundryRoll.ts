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

  constructor(rawFormula: string, data?: Record<string, unknown>) {
    let formula = rawFormula.trim();

    // In FoundryVTT 0.8.8 I don't know why but the system inserts at the end a "+ "
    // so here, if we found that the end of the formula is "+ " we remove it
    if (formula.endsWith('+')) {
      formula = formula.substr(0, formula.length - 1);
    }

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
    return this.dice.map(d => d.results.map(res => res.result)).flat();
  }

  // TODO Evaluate not finished this | Promise<this>
  evaluate(partialOptions?: Partial<Options>): any {
    const options = { ...partialOptions, async: false };

    super.evaluate(options);

    this.abfRoll?.evaluate(options);

    return this;
  }
}
