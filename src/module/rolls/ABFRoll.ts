import type { Options } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/roll';
import ABFFoundryRoll from './ABFFoundryRoll';

export abstract class ABFRoll {
  private readonly DEFAULT_FUMBLE = 3;

  constructor(protected readonly foundryRoll: ABFFoundryRoll) {}

  get fumbled() {
    return this.foundryRoll.firstResult <= this.DEFAULT_FUMBLE;
  }

  abstract evaluate(options?: Partial<Options>): ABFFoundryRoll;

  protected addRoll(newRoll: ABFFoundryRoll) {
    const newResult = JSON.parse(JSON.stringify(this.foundryRoll.dice[0])) as DiceTerm;

    newResult.results[0] = { result: newRoll.getResults()[0], active: true };

    this.foundryRoll.dice.push(newResult);

    // const pool = this.foundryRoll.terms[0];

    // pool.results.push(newResult);

    console.log(this);

    this.foundryRoll.recalculateTotal();

    return newRoll.getResults()[0];
  }

  public getRoll(): ABFFoundryRoll {
    return this.foundryRoll;
  }
}
