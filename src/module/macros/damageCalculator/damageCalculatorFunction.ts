import { renderTemplates } from '../../utils/renderTemplates';
import { Templates } from '../../utils/constants';

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

const calculateResult = (attack, defense, at, damage) => {
  if (defense > attack) {
    return (defense - attack) / 2;
  }

  return (damage * (attack - (defense + at * 10 + 20))) / 100;
};

const roundTo5Multiples = x => Math.round(x / 5) * 5;

export const calculateDamage = (attack: number, defense: number, at: number, damage: number): number => {
  let result = calculateResult(attack, defense, at, damage);

  if ((game as Game).settings.get('animabf', 'roundDamageInMultiplesOf5')) {
    result = roundTo5Multiples(result);
  }

  return result;
};

export const damageCalculatorFunction = async () => {
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
    ui.notifications?.warn('One of the fields is empty or is not a number');
    return;
  }

  const result = calculateDamage(attack, defense, at, damage);

  let final = `<div>HA: ${attack}, HD: ${defense}, at: ${at}, Daño Base: ${damage}</div>`;

  if (defense > attack) {
    final = `${final}<h2>Bono al contraataque: <span style='color:#ff1515'>${result}</span></h2>`;
  } else {
    final = `${final}<h2>Daño final: <span style='color:#ff1515'>${result}</span></h2>`;
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
