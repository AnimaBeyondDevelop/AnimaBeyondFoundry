import { GenericDialog } from './GenericDialog';

export class PromptDialog extends GenericDialog {
  constructor(body: string, { onAccept }: { onAccept?: () => void } = {}) {
    super({
      class: 'prompt-dialog',
      content: `<p class='body'>${body}</p>`,
      buttons: [
        {
          id: 'on-confirm-button',
          fn: onAccept,
          content: (game as Game).i18n.localize('dialogs.accept')
        }
      ]
    });
  }
}
