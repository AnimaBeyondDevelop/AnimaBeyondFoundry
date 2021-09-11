import { Log } from '../../../../../utils/Log';
import { WSCombatManager } from '../WSCombatManager';
import { ABFActor } from '../../../../actor/ABFActor';
import { GMAttackMessage, GMMessageTypes, GMRequestToAttackResponseMessage } from '../gm/WSGMCombatMessageTypes';
import {
  ABFWSUserNotification,
  ABFWSUserRequest,
  UserAttackMessage,
  UserDefendMessage,
  UserMessageTypes,
  UserRequestToAttackMessage
} from './WSUserCombatMessageTypes';
import { UserCombatAttackDialog } from '../../dialogs/UserCombatAttackDialog';
import { UserCombatDefenseDialog } from '../../dialogs/UserCombatDefenseDialog';

export class WSUserCombatManager extends WSCombatManager<ABFWSUserRequest, ABFWSUserNotification> {
  private combatId: string | undefined;

  private attackDialog: UserCombatAttackDialog | undefined;

  public constructor(game: Game) {
    super(game);
  }

  get actor(): ABFActor {
    return this.game.user!.character!;
  }

  receive(msg) {
    switch (msg.type) {
      case GMMessageTypes.RequestToAttackResponse:
        this.manageAttackRequestResponse(msg);
        break;
      case GMMessageTypes.CancelCombat:
        this.manageCancelCombat(msg);
        break;
      case GMMessageTypes.Attack:
        this.manageDefend(msg);
        break;
      default:
        Log.warn('Unknown message', msg);
    }
  }

  private endCombat() {
    this.combatId = undefined;

    if (this.attackDialog) {
      this.attackDialog.close({ force: true });

      this.attackDialog = undefined;
    }
  }

  private manageCancelCombat(msg) {
    if (msg.combatId && msg.combatId !== this.combatId) {
      // The message is not for us
      return;
    }

    this.endCombat();
  }

  public async sendAttack() {
    const { user } = this.game;

    if (!user) return;

    const { targets } = user;

    if (targets.ids.length === 0) {
      ui.notifications?.warn('You have to select one target');
      return;
    }

    if (targets.ids.length > 1) {
      ui.notifications?.warn('You have to select only one target');
      return;
    }

    const target = targets.values().next().value as Token;

    if (!target.actor?.id) {
      ui.notifications?.warn('Target do not have any actor associated');
      return;
    }

    if (user.character?.id) {
      await Dialog.confirm({
        content: `Do you want to attack ${target.actor.name}?`,
        yes: () => {
          if (user.character?.id && target.actor?.id) {
            const msg: UserRequestToAttackMessage = {
              type: UserMessageTypes.RequestToAttack,
              payload: { attackerId: user.character.id, defenderId: target.actor.id }
            };

            this.emit(msg);

            this.attackDialog = new UserCombatAttackDialog(
              {
                attacker: { actor: user.character },
                defender: { actor: target.actor }
              },
              {
                onAttack: attackValues => {
                  const newMsg: UserAttackMessage = {
                    type: UserMessageTypes.Attack,
                    combatId: this.combatId!,
                    payload: {
                      attackValue: attackValues.attack,
                      damageValue: attackValues.damage,
                      critic: attackValues.critic
                    }
                  };

                  this.emit(newMsg);
                }
              }
            );
          }
        }
      });
    } else {
      ui.notifications?.warn("You don't have selected any character");
    }
  }

  private async manageAttackRequestResponse(msg: GMRequestToAttackResponseMessage) {
    if (!this.attackDialog) return;

    if (msg.payload.allowed) {
      this.combatId = msg.combatId;

      this.attackDialog.updatePermissions(msg.payload.allowed);
    } else {
      this.endCombat();

      Dialog.prompt({
        content: `Your attack request have been rejected. ${
          msg.payload.alreadyInACombat
            ? 'GM is already involved in a combat, wait your turn and try to attack again.'
            : ''
        }`,
        callback: () => {}
      });
    }
  }

  private async manageDefend(msg: GMAttackMessage) {
    if (msg.combatId && msg.combatId !== this.combatId) {
      // The message is not for us
      return;
    }

    if (this.actor.id !== msg.payload.defenderId) {
      return;
    }

    const attacker = this.findActorById(msg.payload.attackerId);
    const defender = this.actor;

    try {
      new UserCombatDefenseDialog(
        {
          attacker: { actor: attacker, critic: msg.payload.critic },
          defender: { actor: defender }
        },
        {
          onDefense: defenseValues => {
            const newMsg: UserDefendMessage = {
              type: UserMessageTypes.Defend,
              combatId: msg.combatId,
              payload: { defenseValue: defenseValues.defense, atValue: defenseValues.at }
            };

            this.emit(newMsg);
          }
        }
      );
    } catch (err) {
      if (err) {
        Log.error(err);
      }

      this.endCombat();
    }
  }
}
