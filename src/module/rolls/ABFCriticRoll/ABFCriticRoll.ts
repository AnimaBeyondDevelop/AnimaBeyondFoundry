import ABFFoundryRoll from '../ABFFoundryRoll';
import { ABFRoll } from '../ABFRoll';

export default class ABFCriticRoll extends ABFRoll {

  public evaluate(): ABFFoundryRoll {
    let penalty = 0
    if (this.foundryRoll.total !== undefined && this.foundryRoll.total > 200) {
      penalty -= Math.floor((this.foundryRoll.total - 200) / 2);
    }

    this.foundryRoll.recalculateTotal(penalty);

    return this.foundryRoll;
  }
}
