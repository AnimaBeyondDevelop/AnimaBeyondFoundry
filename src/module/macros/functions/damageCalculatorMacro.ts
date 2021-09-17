import { renderTemplates } from '../../utils/renderTemplates';
import { Templates } from '../../utils/constants';
import { ABFDialogs } from '../../dialogs/ABFDialogs';
import { ABFSettingsKeys } from '../../../utils/registerSettings';

const openDialog = async (): Promise<{ [key: string]: unknown }> => {
  const [dialogHTML, iconHTML] = await renderTemplates(
    {
      name: Templates.Dialog.DamageCalculator,
      context: {}
    },
    {
      name: Templates.Dialog.Icons.Accept
    }
  );

  return new Promise(resolve => {
    const typedGame = game as Game;

    new Dialog({
      title: typedGame.i18n.localize('macros.damageCalculator.dialog.title'),
      content: dialogHTML,
      buttons: {
        submit: {
          icon: iconHTML,
          label: typedGame.i18n.localize('dialogs.continue'),
          callback: (html: JQuery) => {
            const results = new FormDataExtended(html.find('form')[0], {}).toObject();

            resolve(results as { [key: string]: number });
          }
        }
      },
      default: 'submit'
    }).render(true);
  });
};

const calculateDamage = (attack, defense, at, damage) => {
  const damageRoundedToCeil5Multiplier = Math.ceil(damage / 10) * 10;

  return (damageRoundedToCeil5Multiplier * (attack - (defense + at * 10 + 20))) / 100;
};

const roundTo5Multiples = x => Math.round(x / 5) * 5;

const calculateCounterAttackBonus = (attack, defense) => {
  return roundTo5Multiples((defense - attack) / 2);
};

const canCounterAttack = (attack, defense) => defense > attack;

export const calculateCombatResult = (
  attack: number,
  defense: number,
  at: number,
  damage: number
): { canCounterAttack: true; counterAttackBonus: number } | { canCounterAttack: false; damage: number } => {
  const needToRound = (game as Game).settings.get('animabf', ABFSettingsKeys.ROUND_DAMAGE_IN_MULTIPLES_OF_5);

  if (canCounterAttack(attack, defense)) {
    return {
      canCounterAttack: true,
      counterAttackBonus: calculateCounterAttackBonus(attack, defense)
    };
  }

  const result = calculateDamage(attack, defense, at, damage);

  return {
    canCounterAttack: false,
    damage: needToRound ? roundTo5Multiples(result) : result
  };
};

export const damageCalculatorMacro = async () => {
  const results = await openDialog();

  const attack = results['damage-calculator-attack-input'];
  const defense = results['damage-calculator-defense-input'];
  const at = results['damage-calculator-ta-input'];
  const damage = results['damage-calculator-damage-input'];

  if (
    typeof attack !== 'number' ||
    typeof defense !== 'number' ||
    typeof at !== 'number' ||
    typeof damage !== 'number'
  ) {
    ABFDialogs.prompt('One of the fields is empty or is not a number');
    return;
  }

  const result = calculateCombatResult(attack, defense, at, damage);

  let final = `<div>HA: ${attack}, HD: ${defense}, at: ${at}, Daño Base: ${damage}</div>`;

  if (result.canCounterAttack) {
    final = `${final}<h2>Bono al contraataque: <span style='color:#ff1515'>${result.counterAttackBonus}</span></h2>`;
  } else {
    final = `${final}<h2>Daño final: <span style='color:#ff1515'>${result.damage}</span></h2>`;
  }

  const typedGame = game as Game;
  ChatMessage.create({
    content: final,
    whisper: typedGame.collections
      ?.get('User')
      ?.filter(u => u.isGM)
      ?.map(u => u.id)
  });
};
