import ABFFoundryRoll from './ABFFoundryRoll';

export abstract class ABFRoll {
  constructor(protected readonly foundryRoll: ABFFoundryRoll) {}

  abstract evaluate({
    minimize,
    maximize
  }: {
    minimize?: boolean;
    maximize?: boolean;
  }): ABFFoundryRoll;

  protected addRoll(newRoll: ABFFoundryRoll) {
    const newResult = { result: newRoll.results[0] as number, active: true };

    this.foundryRoll.results.push(newResult.result);

    const pool = this.foundryRoll.terms[0];

    pool.results.push(newResult);

    this.foundryRoll.recalculateTotal();

    return newRoll.results[0];
  }

  public getRoll(): ABFFoundryRoll {
    return this.foundryRoll;
  }
}
