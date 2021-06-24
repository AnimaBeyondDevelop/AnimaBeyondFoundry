import { Templates } from './constants';

const resolver = (html): string => {
  const results = new FormDataExtended(html.find('form')[0], {}).toObject();
  return results.mod as string;
};

// Open the mod Dialog window. It returns resolver(html), which in turn returns the modifier
export async function openModDialog(title = 'Dialogo') {
  renderTemplate(Templates.Dialog.ModDialog, {}).then(content => {
    return new Promise(resolve => {
      new Dialog({
        title,
        content,
        buttons: {
          submit: {
            icon: Templates.Dialog.Icons.Accept,
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
  });
}
