import ABFFoundryRoll from '../ABFFoundryRoll';
import ABFExploderRoll from '../ABFExploderRoll/ABFExploderRoll';
import { psychicImbalanceCheck } from '../../combat/utils/psychicImbalanceCheck.js';
import { psychicPotentialEffect } from '../../combat/utils/psychicPotentialEffect.js';
import { psychicFatigueCheck } from '../../combat/utils/psychicFatigueCheck.js';

export default class ABFPsychicRoll extends ABFExploderRoll {
  public evaluate(): ABFFoundryRoll {
    super.evaluate();
    const {
      general: {
        settings: { inhuman, zen }
      },
      psychic: { mentalPatterns },
      power
    } = this.foundryRoll.data;
    let imbalance = psychicImbalanceCheck(this.foundryRoll.data, power) ?? 0;
    let newPotentialTotal = psychicPotentialEffect(
      this.foundryRoll.total ?? 0,
      imbalance,
      inhuman.value,
      zen.value
    );
    if (!psychicFatigueCheck(power?.system.effects[newPotentialTotal].value)) {
      if (power?.system.combatType.value === 'attack' &&
        mentalPatterns.find(i => i.name == 'courage')) {
        newPotentialTotal = psychicPotentialEffect(
          newPotentialTotal,
          1,
          inhuman.value,
          zen.value
        );
      }
    }

    this.foundryRoll.overrideTotal(newPotentialTotal);

    return this.foundryRoll;
  }
}
