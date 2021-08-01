import { renderTemplates } from './renderTemplates';
import { Templates } from './constants';

export const openDialog = async <T = number>({
  title,
  content,
  placeholder = ''
}: {
  title?: string;
  content: string;
  placeholder?: string;
}): Promise<T> => {
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
      title: title ?? game.i18n.localize('dialogs.title'),
      content: dialogHTML,
      buttons: {
        submit: {
          icon: iconHTML,
          label: game.i18n.localize('dialogs.continue'),
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
  return openDialog({
    content: game.i18n.localize('dialogs.mod.content'),
    placeholder: '0'
  });
};