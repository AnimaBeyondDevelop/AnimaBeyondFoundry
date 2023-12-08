import ABFFoundryRoll from '../ABFFoundryRoll';
import ABFExploderRoll from '../ABFExploderRoll/ABFExploderRoll';
import { psychicImbalanceCheck } from '../../combat/utils/psychicImbalanceCheck.js';
import { psychicPotentialEffect } from '../../combat/utils/psychicPotentialEffect.js';

export default class ABFPsychicRoll extends ABFExploderRoll {
  public evaluate(): ABFFoundryRoll {
    super.evaluate();
    const {
      general: {
        settings: { inhuman, zen }
      },
      power
    } = this.foundryRoll.data;
    let imbalance = psychicImbalanceCheck(this.foundryRoll.data, power) ?? 0;
    const newPotentialTotal = psychicPotentialEffect(
      this.foundryRoll.total,
      imbalance,
      inhuman.value,
      zen.value
    );

    this.foundryRoll.overrideTotal(newPotentialTotal);

    return this.foundryRoll;
  }
}
