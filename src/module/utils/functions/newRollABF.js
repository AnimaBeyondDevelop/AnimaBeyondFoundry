import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { openModDialog } from '../dialogs/openSimpleInputDialog';

/** Rolls an ABFoundryFRoll for a given ability  
 * @param {string} abilityPath - Path to the ability to roll, for example `secondaries.notice`.  
 * @param {number} abilityValue - The final value of the secondary ability.  
 * @param {import('../../actor/ABFActor').ABFActor} actor - The actor object for which the ability is rolled.  
 */ 

export const newRollABF = async (abilityPath, abilityValue, actor) => {
  const name = game.i18n.localize(`anima.ui.${abilityPath}.title`);
  const label = name ? `Rolling ${name}` : '';
  const mod = await openModDialog();
  let formula = `1d100xa + ${abilityValue} + ${mod ?? 0}`;
  if (abilityValue >= 200) formula = formula.replace('xa', 'xamastery');
  const roll = new ABFFoundryRoll(formula, actor.system);
  roll.roll();
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: label
  });
  return roll.total;
};