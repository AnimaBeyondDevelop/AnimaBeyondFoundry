import { renderTemplates } from '../../../utils/renderTemplates';
import { Templates } from '../../../utils/constants';
import { ABFActor } from '../../../actor/ABFActor';
import { GenericDialog } from '../../../dialogs/GenericDialog';

/**
 * @param {object} params
 * @param {ABFActor} params.attacker
 * @param {ABFActor} params.defender
 */
const openCombatRequestDialog = async ({ attacker, defender }) => {
  const [dialogHTML] = await renderTemplates({
    name: Templates.Dialog.Combat.CombatRequestDialog,
    context: { data: { attacker, defender } }
  });

  return new Promise((resolve, reject) => {
    new GenericDialog({
      content: dialogHTML,
      onClose: () => reject(),
      buttons: [
        {
          id: 'on-confirm-button',
          fn: () => resolve(),
          content: game.i18n.localize('dialogs.accept')
        },
        {
          id: 'on-cancel-button',
          fn: () => reject(),
          content: game.i18n.localize('dialogs.cancel')
        }
      ]
    });
  });
};

export const CombatDialogs = {
  openCombatRequestDialog
};
