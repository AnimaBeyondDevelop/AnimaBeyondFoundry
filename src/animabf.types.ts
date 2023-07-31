import { ABFConfig } from './module/ABFConfig';
import ABFFoundryRoll from './module/rolls/ABFFoundryRoll';
import { WSUserCombatManager } from './module/combat/websocket/ws-combat/user/WSUserCombatManager';
import { WSGMCombatManager } from './module/combat/websocket/ws-combat/gm/WSGMCombatManager';

export type ABFItemBaseDataSource<
  T,
  D extends Record<string, any>,
  K extends keyof D = keyof D
> = {
  _id: string;

  type: T;
  name: string;

  system: D;

  updateSource?: (data: D) => void;
} & {
  [key in K]: D[K]; // INFO: (AB) Does this makes sense?
};

declare global {
  interface Window {
    ABFFoundryRoll: typeof ABFFoundryRoll;

    Websocket: {
      sendAttack?: typeof WSGMCombatManager.prototype.sendAttack;
      sendAttackRequest?: typeof WSUserCombatManager.prototype.sendAttackRequest;
    };
  }

  interface CONFIG {
    config: typeof ABFConfig;
  }
}
