import { WSGMCombatManager } from './ws-combat/gm/WSGMCombatManager';
import { WSUserCombatManager } from './ws-combat/user/WSUserCombatManager';
import { Log } from '../../../utils/Log';

export const registerCombatWebsocketRoutes = () => {
  const tgame = game as Game;

  if (tgame.user?.isGM) {
    Log.log('Initialized Combat Manager as GM');

    new WSGMCombatManager(tgame);
  } else {
    Log.log('Initialized Combat Manager as User');

    const combatManager = new WSUserCombatManager(tgame);

    window.Websocket = {
      sendAttack: () => combatManager.sendAttack()
    };
  }
};
