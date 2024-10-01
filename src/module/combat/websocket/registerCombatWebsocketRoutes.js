import { WSGMCombatManager } from './ws-combat/gm/WSGMCombatManager';
import { WSUserCombatManager } from './ws-combat/user/WSUserCombatManager';
import { Logger } from '../../../utils';

export const registerCombatWebsocketRoutes = () => {
  if (game.user?.isGM) {
    Logger.log('Initialized Combat Manager as GM');

    const combatManager = new WSGMCombatManager(game);

    window.Websocket = {
      sendAttack: async () => {
        try {
          combatManager.sendAttack();
        } catch (e) {
          Logger.error(e);
          combatManager.endCombat();
        }
      }
    };
  } else {
    Logger.log('Initialized Combat Manager as User');

    const combatManager = new WSUserCombatManager(game);

    window.Websocket = {
      sendAttackRequest: async () => {
        try {
          combatManager.sendAttackRequest();
        } catch (e) {
          Logger.error(e);
          combatManager.endCombat();
        }
      }
    };
  }
};
