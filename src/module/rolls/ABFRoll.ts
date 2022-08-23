import type { Options } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/roll';
import ABFFoundryRoll from './ABFFoundryRoll';

export abstract class ABFRoll {
  protected readonly DEFAULT_FUMBLE_RANGE = 3;
  protected readonly DEFAULT_OPEN_RANGE = 90;
  protected readonly DEFAULT_OPEN_WITH_DOUBLES = false;

  protected openRollRange = this.DEFAULT_OPEN_RANGE;
  protected fumbleRange = this.DEFAULT_FUMBLE_RANGE;
  protected openOnDoubles = this.DEFAULT_OPEN_WITH_DOUBLES;

  constructor(protected readonly foundryRoll: ABFFoundryRoll) {
    if (this.foundryRoll.data.general !== undefined) {
      this.openOnDoubles = this.foundryRoll.data.general.settings.openOnDoubles.value 
      this.openRollRange = this.foundryRoll.data.general.settings.openRolls.value 
      if (this.openRollRange === 0) //If openRollRange is set to 0 it's probably an actor from 1.14 that hasn't been configured
        this.openRollRange = this.DEFAULT_OPEN_RANGE;
      this.fumbleRange = this.foundryRoll.data.general.settings.fumbles.value
      if (foundryRoll.formula.includes('mastery') && this.fumbleRange > 1) 
        this.fumbleRange -= 1
    }
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
