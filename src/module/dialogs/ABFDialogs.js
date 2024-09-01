import { PromptDialog } from './PromptDialog';
import { ConfirmationDialog } from './ConfirmationDialog';

export const ABFDialogs = {
  /**
   * @param {string} body
   * @returns {Promise<void>}
   */
  prompt: body =>
    new Promise(resolve => {
      new PromptDialog(body, { onAccept: () => resolve() });
    }),

  /** @type {(title: string, body: string) => Promise<void>} */
  /**
   * @param {string} title
   * @param {string} body
   * @param {{ onConfirm?: () => void; onCancel?: () => void }}
   * @returns {Promise<string>}
   */
  confirm: (title, body, { onConfirm, onCancel } = {}) =>
    new Promise(resolve => {
      new ConfirmationDialog(title, body, {
        onConfirm: () => {
          onConfirm?.();
          resolve('confirm');
        },
        onCancel: () => {
          onCancel?.();
          resolve('cancel');
        }
      });
    })
};
