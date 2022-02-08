import { ABFDialogs } from "../../../../dialogs/ABFDialogs";

export function getSelectedToken(game: Game): TokenDocument {
  const selectedTokens = game.canvas.tokens?.controlled || [];

  switch (selectedTokens.length) {
    case 1:
      return selectedTokens[0].document;

    case 0:
      let msg = game.i18n.localize('macros.combat.dialog.error.noSelectedToken.title');
      ABFDialogs.prompt(msg);
      throw new Error(msg);

    default:
      msg = game.i18n.localize('macros.combat.dialog.error.multipleSelectedToken.title');
      ABFDialogs.prompt(msg);
      throw new Error(msg);
  }
}
