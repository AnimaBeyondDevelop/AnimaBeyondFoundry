import ABFFoundryRoll from '../ABFFoundryRoll';
import ABFExploderRoll from '../ABFExploderRoll/ABFExploderRoll';
import { psychicPotentialEffect } from '../../combat/utils/psychicPotentialEffect.js';
import { psychicFatigueCheck } from '../../combat/utils/psychicFatigueCheck.js';

export default class ABFPsychicRoll extends ABFExploderRoll {
  /** @returns {Promise<ABFFoundryRoll>} */
  async evaluate() {
    await super.evaluate();
    const {
      psychic: { mentalPatterns, psychicDisciplines },
      power,
      mentalPatternImbalance
    } = this.foundryRoll.data;
    const powerDiscipline = power?.system.discipline.value;
    // @ts-ignore
    const { imbalance } = psychicDisciplines.find(
      i => i.name === powerDiscipline
    )?.system;
    let newPotentialTotal = psychicPotentialEffect(
      this.foundryRoll.total ?? 0,
      imbalance
    );
    if (!psychicFatigueCheck(power?.system.effects[newPotentialTotal].value)) {
      newPotentialTotal = psychicPotentialEffect(
        newPotentialTotal,
        mentalPatternImbalance ||
          (power?.system.combatType.value === 'attack' &&
            mentalPatterns.find(i => i.name == 'courage'))
      );
    }

    this.foundryRoll.overrideTotal(newPotentialTotal);

    return new Promise((resolve, reject) => {
      resolve(this.foundryRoll);
    });
  }
}
