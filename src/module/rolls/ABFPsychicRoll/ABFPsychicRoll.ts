import ABFFoundryRoll from '../ABFFoundryRoll';
import ABFExploderRoll from '../ABFExploderRoll/ABFExploderRoll';
import { difficultyAchieved } from '../../combat/utils/difficultyAchieved.js';
import { psychicFatigueCheck } from '../../combat/utils/psychicFatigueCheck.js';

export default class ABFPsychicRoll extends ABFExploderRoll {
  public evaluate(): ABFFoundryRoll {
    super.evaluate();
    const {
      general: {
        settings: { inhuman, zen }
      },
      psychic: { mentalPatterns, psychicDisciplines },
      power,
      mentalPatternImbalance
    } = this.foundryRoll.data;
    const powerDiscipline = power?.system.discipline.value;
    // @ts-ignore
    let imbalance: any = psychicDisciplines.find((i: any) => i.name === powerDiscipline)?.system.imbalance ? 1 : 0;
    let newPotentialTotal = difficultyAchieved(
      this.foundryRoll.total ?? 0,
      imbalance,
      inhuman.value,
      zen.value
    );
    if (!psychicFatigueCheck(power?.system.effects[newPotentialTotal].value)) {
      if (mentalPatternImbalance) {
        newPotentialTotal = difficultyAchieved(
          newPotentialTotal,
          1,
          inhuman.value,
          zen.value
        );
      }
      else if (power?.system.combatType.value === 'attack' &&
        mentalPatterns.find((i: any) => i.name === 'courage')) {
        newPotentialTotal = difficultyAchieved(
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
