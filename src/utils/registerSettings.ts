export enum ABFSettingsKeys {
  AUTO_ACCEPT_COMBAT_REQUESTS = 'AUTO_ACCEPT_COMBAT_REQUESTS',
  ROUND_DAMAGE_IN_MULTIPLES_OF_5 = 'ROUND_DAMAGE_IN_MULTIPLES_OF_5',
  SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT = 'SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT',
  DEVELOP_MODE = 'DEVELOP_MODE'
}

export const registerSettings = () => {
  const typedGame = game as Game;

  typedGame.settings.register('animabf', ABFSettingsKeys.AUTO_ACCEPT_COMBAT_REQUESTS, {
    name: 'anima.ui.systemSettings.autoAcceptCombatRequests.title',
    hint: 'anima.ui.systemSettings.autoAcceptCombatRequests.hint.title',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  typedGame.settings.register('animabf', ABFSettingsKeys.ROUND_DAMAGE_IN_MULTIPLES_OF_5, {
    name: 'anima.ui.systemSettings.roundDamageInMultiplesOf5.title',
    hint: 'anima.ui.systemSettings.roundDamageInMultiplesOf5.hint.title',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  });

  typedGame.settings.register('animabf', ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT, {
    name: 'anima.ui.systemSettings.sendRollMessagesOnCombatByDefault.title',
    hint: 'anima.ui.systemSettings.sendRollMessagesOnCombatByDefault.hint.title',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  });

  typedGame.settings.register('animabf', ABFSettingsKeys.DEVELOP_MODE, {
    name: 'Develop mode',
    hint: 'Activate certain access to information. Only for developers',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });
};
