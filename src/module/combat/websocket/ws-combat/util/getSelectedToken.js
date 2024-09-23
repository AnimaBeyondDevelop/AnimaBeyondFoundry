import { ABFDialogs } from '../../../../dialogs/ABFDialogs';

/**
 *
 * @param {Game} game
 * @returns
 */
export function getSelectedToken(game) {
  const selectedTokens = game.canvas.tokens?.controlled ?? [];

  if (selectedTokens.length !== 1) {
    const msg = game.i18n.localize(
      selectedTokens.length > 0
        ? 'macros.combat.dialog.error.multipleSelectedToken.title'
        : 'macros.combat.dialog.error.noSelectedToken.title'
    );

    ABFDialogs.prompt(msg);
    throw new Error(msg);
  }

  return selectedTokens[0].document;
}
