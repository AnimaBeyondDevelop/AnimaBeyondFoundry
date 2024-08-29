import ABFFoundryRoll from '../ABFFoundryRoll';
import { ABFRoll } from '../ABFRoll';

export default class ABFControlRoll extends ABFRoll {
  success = false;

  /** @returns {Promise<ABFFoundryRoll>} */
  evaluate() {
    let penalty = Math.max(
      0,
      Math.floor(-this.foundryRoll.data.general.modifiers.allActions.final.value / 20)
    );

    if (this.foundryRoll.lastResult === 10) {
      this.success = true;
      penalty -= 2;
    }

    this.foundryRoll.recalculateTotal(-penalty);

    return new Promise((resolve, reject) => {
      resolve(this.foundryRoll);
    });
  }
}
