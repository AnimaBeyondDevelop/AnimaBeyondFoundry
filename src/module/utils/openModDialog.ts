import { Templates } from './constants';
import { renderTemplates } from './renderTemplates';

const resolver = (html): string => {
  const results = new FormDataExtended(html.find('form')[0], {}).toObject();
  return results.mod as string;
};

// Open the mod Dialog window. It returns resolver(html), which in turn returns the modifier
export async function openModDialog(title = game.i18n.localize('dialogs.title')) {
  const [dialogHTML, iconHTML] = await renderTemplates(
    { name: Templates.Dialog.ModDialog },
    { name: Templates.Dialog.Icons.Accept }
  );

  return new Promise(resolve => {
    new Dialog({
      title,
      content: dialogHTML,
      buttons: {
        submit: {
          icon: iconHTML,
          label: game.i18n.localize('dialogs.continue'),
          callback: html => {
            resolve(resolver(html));
          }
        }
      },
      default: 'submit',
      render: () => $('#mod').focus()
    }).render(true);
  });
}
