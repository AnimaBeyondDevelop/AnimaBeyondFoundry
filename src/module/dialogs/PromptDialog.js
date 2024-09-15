import { GenericDialog } from './GenericDialog';

export class PromptDialog extends GenericDialog {
  /**
   * @param {string} body
   * @param {object} [hooks]
   * @param {() => void} [onAccept]
   */
  constructor(body, { onAccept } = {}) {
    super({
      class: 'prompt-dialog',
      content: `<p class='body'>${body}</p>`,
      buttons: [
        {
          id: 'on-confirm-button',
          fn: onAccept,
          content: game.i18n.localize('dialogs.accept')
        }
      ]
    });
  }
}
