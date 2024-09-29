import { GenericDialog } from './GenericDialog';

export class ConfirmationDialog extends GenericDialog {
  /**
   * @param {string} title
   * @param {string} body
   * @param {object} hooks
   * @param {() => void} hooks.onConfirm
   * @param {() => void} hooks.onCancel
   */
  constructor(
    title,
    body,
    { onConfirm, onCancel } = {
      onConfirm: () => {
        this.close();
      },
      onCancel: () => {
        this.close();
      }
    }
  ) {
    super({
      class: 'confirmation-dialog',
      content: `
    <p class='title'>${title}</p>
    <div class='body'>${body}</div>
`,
      buttons: [
        {
          id: 'on-cancel-button',
          fn: onCancel,
          content: game.i18n.localize('dialogs.cancel')
        },
        {
          id: 'on-confirm-button',
          fn: onConfirm,
          content: game.i18n.localize('dialogs.accept')
        }
      ]
    });
  }
}
