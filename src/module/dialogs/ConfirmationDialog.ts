import { GenericDialog } from './GenericDialog';

export class ConfirmationDialog extends GenericDialog {
  constructor(
    title: string,
    body: string,
    { onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void } = {
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
    <p class='body'>${body}</p>
`,
      buttons: [
        { id: 'on-cancel-button', fn: onCancel, content: (game as Game).i18n.localize('dialogs.cancel') },
        { id: 'on-confirm-button', fn: onConfirm, content: (game as Game).i18n.localize('dialogs.accept') }
      ]
    });
  }
}
