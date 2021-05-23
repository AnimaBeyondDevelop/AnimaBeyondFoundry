import ABFFoundryRoll from './ABFFoundryRoll';

export abstract class ABFRoll {
  private readonly DEFAULT_FUMBLE = 3;

  constructor(protected readonly foundryRoll: ABFFoundryRoll) {}

  get fumbled() {
    return this.foundryRoll.firstResult <= this.DEFAULT_FUMBLE;
  }

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
