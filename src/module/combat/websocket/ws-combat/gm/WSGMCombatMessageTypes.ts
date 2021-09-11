import {
  UserAttackMessage,
  UserDefendMessage,
  UserRequestToAttackMessage
} from '../user/WSUserCombatMessageTypes';
import { WeaponCritic } from '../../../../types/combat/WeaponItemConfig';

export enum GMMessageTypes {
  Attack = 'GMAttack',
  RequestToAttackResponse = 'GMRequestToAttackResponse',
  CancelCombat = 'GMCancelCombat'
}

export type GMAttackMessage = {
  type: GMMessageTypes.Attack;
  combatId: string;
  payload: {
    attackerId: string;
    critic: WeaponCritic;
    defenderId: string;
  };
};

export type GMCancelCombatMessage = {
  type: GMMessageTypes.CancelCombat;
  combatId: string;
};

export type GMRequestToAttackResponseMessage = {
  type: GMMessageTypes.RequestToAttackResponse;
  combatId?: string;
  payload: {
    allowed: boolean;
    alreadyInACombat?: boolean;
  };
};

export type ABFWSGMRequest = GMRequestToAttackResponseMessage | GMAttackMessage | GMCancelCombatMessage;

export type ABFWSGMNotification =
  | UserRequestToAttackMessage
  | UserDefendMessage
  | UserAttackMessage;
