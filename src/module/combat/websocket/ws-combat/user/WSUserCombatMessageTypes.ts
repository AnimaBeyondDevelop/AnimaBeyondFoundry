import { ABFWSGMNotification, ABFWSGMRequest } from '../gm/WSGMCombatMessageTypes';
import { UserCombatAttackResult } from '../../../../dialogs/combat/CombatAttackDialog';
import { UserCombatDefenseResult } from '../../../../dialogs/combat/CombatDefenseDialog';

export enum UserMessageTypes {
  RequestToAttack = 'UserRequestToAttackRequest',
  Attack = 'UserAttack',
  Defend = 'UserDefend'
}

export type UserRequestToAttackMessage = {
  type: UserMessageTypes.RequestToAttack;
  senderId: string;
  payload: {
    attackerTokenId: string;
    defenderTokenId: string;
  };
};

export type UserAttackMessage = {
  type: UserMessageTypes.Attack;
  payload: UserCombatAttackResult;
};

export type UserDefendMessage = {
  type: UserMessageTypes.Defend;
  payload: UserCombatDefenseResult;
};

export type ABFWSUserRequest = ABFWSGMNotification;

export type ABFWSUserNotification = ABFWSGMRequest;
