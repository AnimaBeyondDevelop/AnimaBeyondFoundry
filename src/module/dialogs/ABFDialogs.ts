import { PromptDialog } from './PromptDialog';
import { ConfirmationDialog } from './ConfirmationDialog';

export const ABFDialogs = {
  prompt: (body: string) =>
    new Promise<void>(resolve => {
      new PromptDialog(body, { onAccept: () => resolve() });
    }),
  confirm: (
    title: string,
    body: string,
    { onConfirm, onCancel }: { onConfirm?: () => void; onCancel?: () => void } = {}
  ) =>
    new Promise<string>(resolve => {
      new ConfirmationDialog(title, body, {
        onConfirm: () => {
          onConfirm?.();
          resolve("confirm");
        },
        onCancel: () => {
          onCancel?.();
          resolve("cancel");
        }
      });
    })
};
