import { renderTemplates } from '../renderTemplates';
import { Templates } from '../constants';

export const openComplexInputDialog = async (actor, dialogType) => {
  const referencedGame = game;
  let castOverride = false;
  if (dialogType  == 'newMysticShield'){
    castOverride = actor.getFlag(
      'world',
      `${actor._id}.spellCastingOverride`
    );
  }
  const [dialogHTML, iconHTML] = await renderTemplates(
    {
      name: Templates.Dialog[dialogType],
      context: {
        data: {
          actor,
          mystic: {
            spellUsed: undefined,
            spellGrade: 'base',
            castInnate: false,
            castPrepared: false,
            castOverride
          }
        }
      }
    },
    {
      name: Templates.Dialog.Icons.Accept
    }
  );

  return new Promise(resolve => {
    new Dialog({
      title: referencedGame.i18n.localize('dialogs.title'),
      content: dialogHTML,
      buttons: {
        submit: {
          icon: iconHTML,
          label: referencedGame.i18n.localize('dialogs.continue'),
          callback: html => {
            const results = new FormDataExtended(html.find('form')[0], {}).object;

            resolve(results);
          }
        }
      },
      default: 'submit'
    }).render(true);
  });
};
