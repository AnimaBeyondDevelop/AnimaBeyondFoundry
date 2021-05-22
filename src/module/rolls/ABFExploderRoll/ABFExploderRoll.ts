import ABFFoundryRoll from '../ABFFoundryRoll';

export default class ABFExploderRoll {
  public readonly foundryRoll: ABFFoundryRoll;

  private openRange = 90;
  private fumbleRange = 3;

  private readonly canExplode: boolean;

  constructor(foundryRoll: ABFFoundryRoll) {
    this.foundryRoll = foundryRoll;

    this.canExplode = this.foundryRoll._formula.includes('xa');
  }

  public evaluate({
    minimize,
    maximize
  }: {
    minimize?: boolean;
    maximize?: boolean;
  } = {}): ABFFoundryRoll {
    if (this.canExplode && this.foundryRoll.results[0] >= this.openRange) {
      this.explodeDice(this.openRange);
    }

    return this.foundryRoll;
  }

  private explodeDice(openRange: number) {
    const newRoll = new ABFFoundryRoll(`1d100`).evaluate();
    const newResult = this.addRoll(newRoll);

    if (newResult >= Math.min(openRange, 100)) {
      this.explodeDice(openRange + 1);
    }
  }

  private addRoll(newRoll: ABFFoundryRoll) {
    const newResult = { result: newRoll.results[0] as number, active: true };

    this.foundryRoll.results.push(newResult.result);

    const pool = this.foundryRoll.terms[0];

    pool.results.push(newResult);

    this.foundryRoll.recalculateTotal();

    return newRoll.results[0];
  }
}
