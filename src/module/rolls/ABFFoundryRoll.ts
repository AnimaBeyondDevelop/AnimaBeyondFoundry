import ABFExploderRoll from './ABFExploderRoll/ABFExploderRoll';
import { ABFRoll } from './ABFRoll';
import ABFInitiativeRoll from './ABFInitiativeRoll/ABFInitiativeRoll';
import ABFControlRoll from './ABFControlRoll/ABFControlRoll';
import ABFCriticRoll from './ABFCriticRoll/ABFCriticRoll';
import ABFPsychicRoll from './ABFPsychicRoll/ABFPsychicRoll';
import { ABFActorDataSourceData } from '../types/Actor';

/**
 * This class represents the entrypoint of Foundry
 * We must never add our logic here, all of it must be placed in its own class like ABFExploredRoll
 */
export default class ABFFoundryRoll extends Roll<ABFActorDataSourceData> {
  private readonly abfRoll: ABFRoll | undefined;

  constructor(
    rawFormula: string,
    data?: ABFActorDataSourceData,
    options?: Partial<RollTerm.EvaluationOptions>
  ) {
    let formula = rawFormula.trim();

    // In FoundryVTT 0.8.8 I don't know why but the system inserts at the end a "+ "
    // so here, if we found that the end of the formula is "+ " we remove it
    if (formula.endsWith('+')) {
      formula = formula.substr(0, formula.length - 1);
    }

    super(formula, data, options);

    if (data) {
      this.data = data;
    }

    if (this.formula.includes('xa')) {
      this.abfRoll = new ABFExploderRoll(this);
    }

    if (this.formula.includes('Initiative')) {
      this.abfRoll = new ABFInitiativeRoll(this);
    }

    if (this.formula.includes('ControlRoll')) {
      this.abfRoll = new ABFControlRoll(this);
    }

      if (this.formula.includes('CriticRoll')) {
          this.abfRoll = new ABFCriticRoll(this);
      }
    if (this.formula.includes('PsychicRoll')) {
      this.abfRoll = new ABFPsychicRoll(this);
    }
  }

  get firstResult() {
    return this.getResults()[0];
  }

  get lastResult() {
    return this.getResults()[this.getResults().length - 1];
  }

  get fumbled() {
    if (this.abfRoll instanceof ABFExploderRoll) return this.abfRoll?.fumbled || false;
    return false;
  }

  recalculateTotal(mod = 0) {
    this._total = this._evaluateTotal() + mod;
  }

  overrideTotal(newtotal = 0) {
    if (newtotal) {
      this._total = newtotal;
    }
  }

  getResults(): number[] {
    return this.dice.map(d => d.results.map(res => res.result)).flat();
  }

  // TODO Evaluate not finished this | Promise<this>
  evaluate(partialOptions?: any): any {
    const options = { ...partialOptions, async: false };

    super.evaluate(options);

    this.abfRoll?.evaluate(options);

    return this;
  }
}
