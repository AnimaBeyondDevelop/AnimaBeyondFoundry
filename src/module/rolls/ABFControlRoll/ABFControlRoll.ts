import ABFFoundryRoll from '../ABFFoundryRoll';
import { ABFRoll } from '../ABFRoll';

export default class ABFControlRoll extends ABFRoll {
  success = false;

  public evaluate(): ABFFoundryRoll {
    if (this.foundryRoll.total === 10) {
      this.success = true;
      this.foundryRoll.recalculateTotal(2);
    }

    return this.foundryRoll;
  }
}
