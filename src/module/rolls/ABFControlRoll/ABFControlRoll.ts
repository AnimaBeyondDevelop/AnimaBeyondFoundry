import ABFFoundryRoll from '../ABFFoundryRoll';
import { ABFRoll } from '../ABFRoll';

export default class ABFControlRoll extends ABFRoll {
  success = false;

  public evaluate(): Promise<ABFFoundryRoll> {
    let penalty = Math.max(0, Math.floor(-this.foundryRoll.data.general.modifiers.allActions.final.value / 20));

    if (this.foundryRoll.lastResult === 10) {
      this.success = true;
      penalty -= 2;
    }

    this.foundryRoll.recalculateTotal(-penalty);

    return new Promise<ABFFoundryRoll>((resolve, reject) => {
      resolve(this.foundryRoll);
    });
  }
}
