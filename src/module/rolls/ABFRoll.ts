import type { Options } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/roll';
import ABFFoundryRoll from './ABFFoundryRoll';

export abstract class ABFRoll {
  protected readonly DEFAULT_FUMBLE_RANGE = 3;

  constructor(protected readonly foundryRoll: ABFFoundryRoll) {}

  get fumbled() {
    return this.foundryRoll.firstResult <= this.DEFAULT_FUMBLE_RANGE;
  }

  get firstDice(): DiceTerm {
    return this.foundryRoll.dice[0];
  }

  protected addRoll(newRoll: ABFFoundryRoll) {
    this.firstDice.results.push({
      result: newRoll.getResults()[0],
      active: true
    });

    return newRoll.getResults()[0];
  }

  public getRoll(): ABFFoundryRoll {
    return this.foundryRoll;
  }

  abstract evaluate(options?: Partial<Options>): ABFFoundryRoll;
}
