import { renderTemplates } from '../renderTemplates';
import { Templates } from '../constants';

/**
 * Opens a dialog to enter the number of mass members.
 * @param {{ title?: string, initialValue?: number }} [options]
 * @returns {Promise<number | null>} Member count, or null if cancelled.
 */
export async function openCalculateMassLifeDialog({
  title = '',
  initialValue = 1
} = {}) {
  const [dialogHTML, acceptIconHTML] = await renderTemplates(
    {
      name: Templates.Dialog.ModDialog,
      context: {
        content: game.i18n.localize('anima.ui.settings.massSettings.calculateLife.dialog.content'),
        placeholder: game.i18n.localize('anima.ui.settings.massSettings.calculateLife.dialog.placeholder')
      }
    },
    {
      name: Templates.Dialog.Icons.Accept
    }
  );

  return new Promise(resolve => {
    const dialog = new Dialog({
      title: title || game.i18n.localize('anima.ui.settings.massSettings.calculateLife.dialog.title'),
      content: dialogHTML,
      buttons: {
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('dialogs.cancel'),
          callback: () => resolve(null)
        },
        submit: {
          icon: acceptIconHTML,
          label: game.i18n.localize('dialogs.accept'),
          callback: html => {
            const results = new FormDataExtended(html.find('form')[0], {}).object;
            const raw = results['dialog-input'];
            const count = Math.floor(Number(raw) || 0);
            resolve(count > 0 ? count : null);
          }
        }
      },
      default: 'submit',
      close: () => resolve(null),
      render: html => {
        const input = html.find('#dialog-input');
        input.attr('type', 'number');
        input.attr('min', '1');
        input.attr('step', '1');
        input.val(initialValue);
        input.focus();
      }
    });

    dialog.render(true);
  });
}
