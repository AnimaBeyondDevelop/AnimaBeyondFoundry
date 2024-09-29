import { ABFDialogs } from '../../../../dialogs/ABFDialogs';

export const assertCurrentScene = () => {
  if (game.scenes?.current?.id !== game.scenes?.active?.id) {
    const message = game.i18n.localize(
      'macros.combat.dialog.error.notInActiveScene.title'
    );
    ABFDialogs.prompt(message);
    throw new Error(message);
  }
};
