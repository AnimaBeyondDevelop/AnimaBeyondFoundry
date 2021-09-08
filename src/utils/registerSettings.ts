export const registerSettings = () => {
  const typedGame = game as Game;

  typedGame.settings.register('animabf', 'roundDamageInMultiplesOf5', {
    name: 'anima.ui.systemSettings.roundDamageInMultiplesOf5.title',
    hint: 'anima.ui.systemSettings.roundDamageInMultiplesOf5.hint.title',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  });
};
