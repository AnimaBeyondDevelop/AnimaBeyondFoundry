import type { Options } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/roll';
import ABFFoundryRoll from './ABFFoundryRoll';

export abstract class ABFRoll {
  protected readonly DEFAULT_FUMBLE_RANGE = 3;
  protected readonly DEFAULT_OPEN_RANGE = 90;

  protected openRollRange = this.DEFAULT_OPEN_RANGE;
  protected fumbleRange = this.DEFAULT_FUMBLE_RANGE;

  constructor(protected readonly foundryRoll: ABFFoundryRoll) {
    if (this.foundryRoll.data.general !== undefined) {
      this.openRollRange = this.foundryRoll.data.general.ranges.openRolls.value 
      this.fumbleRange = this.foundryRoll.data.general.ranges.fumbles.value 
    }
  }

  get fumbled() {
    console.log(this.fumbleRange)
    return this.foundryRoll.firstResult <= this.fumbleRange;
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
