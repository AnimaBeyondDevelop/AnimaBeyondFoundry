import { ABFMacros } from '../module/macros/ABFMacros';

export function registerKeyBindings() {
  game.keybindings.register(game.abf.id, 'damageCalculator', {
    name: game.i18n.localize('keyBindings.damageCalculator.name'),
    hint: game.i18n.localize('keyBindings.damageCalculator.hint'),
    editable: [
      {
        key: 'Digit1',
        modifiers: ['Control']
      }
    ],
    onDown: () => {
      ABFMacros.damageCalculator();
      return true;
    },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });

  game.keybindings.register(game.abf.id, 'sendAttack', {
    name: game.i18n.localize('keyBindings.sendAttack.name'),
    hint: game.i18n.localize('keyBindings.sendAttack.hint'),
    editable: [
      {
        key: 'Digit2',
        modifiers: ['Control']
      }
    ],
    onDown: () => {
      if (game.user.isGM) {
        window.Websocket.sendAttack?.();
      } else {
        window.Websocket.sendAttackRequest?.();
      }
      return true;
    },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
}
