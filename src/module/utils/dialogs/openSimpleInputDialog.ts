import { renderTemplates } from '../renderTemplates';
import { Templates } from '../constants';

export const openSimpleInputDialog = async <T = number>({
  title,
  content,
  placeholder = ''
}: {
  title?: string;
  content: string;
  placeholder?: string;
}): Promise<T> => {
  const referencedGame = game as Game;

  const [dialogHTML, iconHTML] = await renderTemplates(
    {
      name: Templates.Dialog.ModDialog,
      context: { content, placeholder }
    },
    {
      name: Templates.Dialog.Icons.Accept
    }
  );

  return new Promise(resolve => {
    new Dialog({
      title: title ?? referencedGame.i18n.localize('dialogs.title'),
      content: dialogHTML,
      buttons: {
        submit: {
          icon: iconHTML,
          label: referencedGame.i18n.localize('dialogs.continue'),
          callback: (html: JQuery) => {
            const results = new FormDataExtended(html.find('form')[0], {}).toObject();

            resolve(results['dialog-input'] as T);
          }
        }
      },
      default: 'submit',
      render: () => $('#dialog-input').focus()
    }).render(true);
  });
};

// Open the mod Dialog window. It returns resolver(html), which in turn returns the modifier
export const openModDialog = async () => {
  const referencedGame = game as Game;

  return openSimpleInputDialog({
    content: referencedGame.i18n.localize('dialogs.mod.content'),
    placeholder: '0'
  });
};
