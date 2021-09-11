import { renderTemplates } from '../../../utils/renderTemplates';
import { Templates } from '../../../utils/constants';
import { ABFActor } from '../../../actor/ABFActor';

const openCombatRequestDialog = async ({ attacker, defender }: { attacker: ABFActor; defender: ABFActor }) => {
  const [dialogHTML, acceptIconHTML, cancelIconHTML] = await renderTemplates(
    {
      name: Templates.Dialog.Combat.CombatRequestDialog,
      context: { data: { attacker, defender } }
    },
    {
      name: Templates.Dialog.Icons.Accept
    },
    {
      name: Templates.Dialog.Icons.Cancel
    }
  );

  return new Promise<void>((resolve, reject) => {
    new Dialog(
      {
        title: 'Attack request',
        content: dialogHTML,
        close: () => {
          reject();
        },
        buttons: {
          cancel: {
            icon: cancelIconHTML,
            label: 'Reject',
            callback: () => {
              reject();
            }
          },
          accept: {
            icon: acceptIconHTML,
            label: 'Accept',
            callback: () => {
              resolve();
            }
          }
        },
        default: 'accept'
      },
      { width: 722, height: 420 }
    ).render(true);
  });
};

export const CombatDialogs = {
  openCombatRequestDialog
};
