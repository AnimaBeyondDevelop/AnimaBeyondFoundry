import { ABFWSGMNotification, ABFWSGMRequest } from '../gm/WSGMCombatMessageTypes';
import { WeaponCritic } from '../../../../types/combat/WeaponItemConfig';

export enum UserMessageTypes {
  RequestToAttack = 'UserRequestToAttackRequest',
  Attack = 'UserAttack',
  Defend = 'UserDefend'
}

export type UserRequestToAttackMessage = {
  type: UserMessageTypes.RequestToAttack;
  payload: {
    attackerId: string;
    defenderId: string;
  };
};

export type UserAttackMessage = {
  type: UserMessageTypes.Attack;
  combatId: string;
  payload: {
    attackValue: number;
    damageValue: number;
    critic: WeaponCritic;
  };
};

export type UserDefendMessage = {
  type: UserMessageTypes.Defend;
  combatId: string;
  payload: {
    defenseValue: number;
    atValue: number;
  };
};

export type ABFWSUserRequest = ABFWSGMNotification;

export type ABFWSUserNotification = ABFWSGMRequest;
