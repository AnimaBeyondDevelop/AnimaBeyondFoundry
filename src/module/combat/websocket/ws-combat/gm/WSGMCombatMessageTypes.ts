import { UserAttackMessage, UserDefendMessage, UserRequestToAttackMessage } from '../user/WSUserCombatMessageTypes';
import { UserCombatAttackResult } from '../../../../dialogs/combat/CombatAttackDialog';

export enum GMMessageTypes {
  Attack = 'GMAttack',
  CounterAttack = 'GMCounterAttack',
  RequestToAttackResponse = 'GMRequestToAttackResponse',
  CancelCombat = 'GMCancelCombat'
}

export type GMAttackMessage = {
  type: GMMessageTypes.Attack;
  payload: {
    attackerTokenId: string;
    defenderTokenId: string;
    result: UserCombatAttackResult;
  };
};

export type GMCounterAttackMessage = {
  type: GMMessageTypes.CounterAttack;
  payload: {
    attackerTokenId: string;
    defenderTokenId: string;
    counterAttackBonus?: number;
  };
};

export type GMCancelCombatMessage = {
  type: GMMessageTypes.CancelCombat;
  combatId: string;
};

export type GMRequestToAttackResponseMessage = {
  type: GMMessageTypes.RequestToAttackResponse;
  toUserId: string;
  payload: {
    allowed: boolean;
    alreadyInACombat?: boolean;
  };
};

export type ABFWSGMRequest =
  | GMRequestToAttackResponseMessage
  | GMAttackMessage
  | GMCounterAttackMessage
  | GMCancelCombatMessage;

export type ABFWSGMNotification = UserRequestToAttackMessage | UserDefendMessage | UserAttackMessage;
