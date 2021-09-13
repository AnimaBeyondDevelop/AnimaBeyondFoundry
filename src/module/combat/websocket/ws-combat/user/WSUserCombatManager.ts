import { Log } from '../../../../../utils/Log';
import { WSCombatManager } from '../WSCombatManager';
import { ABFActor } from '../../../../actor/ABFActor';
import {
  GMAttackMessage,
  GMCounterAttackMessage,
  GMMessageTypes,
  GMRequestToAttackResponseMessage
} from '../gm/WSGMCombatMessageTypes';
import {
  ABFWSUserNotification,
  ABFWSUserRequest,
  UserAttackMessage,
  UserDefendMessage,
  UserMessageTypes,
  UserRequestToAttackMessage
} from './WSUserCombatMessageTypes';
import { CombatAttackDialog } from '../../../../dialogs/combat/CombatAttackDialog';
import { CombatDefenseDialog } from '../../../../dialogs/combat/CombatDefenseDialog';
import { PromptDialog } from '../../../../dialogs/PromptDialog';
import { ABFDialogs } from '../../../../dialogs/ABFDialogs';

export class WSUserCombatManager extends WSCombatManager<ABFWSUserRequest, ABFWSUserNotification> {
  private attackDialog: CombatAttackDialog | undefined;
  private defenseDialog: CombatDefenseDialog | undefined;

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
        this.manageCancelCombat();
        break;
      case GMMessageTypes.Attack:
        this.manageDefend(msg);
        break;
      case GMMessageTypes.CounterAttack:
        this.manageCounterAttack(msg);
        break;
      default:
        Log.warn('Unknown message', msg);
    }
  }

  private endCombat() {
    if (this.attackDialog) {
      this.attackDialog.close({ force: true });

      this.attackDialog = undefined;
    }

    if (this.defenseDialog) {
      this.defenseDialog.close({ force: true });

      this.defenseDialog = undefined;
    }
  }

  private manageCancelCombat() {
    this.endCombat();
  }

  get user() {
    return this.game.user!;
  }

  get character(): ABFActor | undefined {
    const actor = this.game.scenes?.active?.tokens.find(t => t.data.actorId === this.user.character?.id)?.actor;

    if (actor) return actor;

    return undefined;
  }

  public async sendAttackRequest() {
    const { user } = this.game;

    if (!user) return;

    const { targets } = user;

    if (targets.ids.length === 0) {
      ABFDialogs.prompt('You have to select one target');
      return;
    }

    if (targets.ids.length > 1) {
      ABFDialogs.prompt('You have to select only one target');
      return;
    }

    const target = targets.values().next().value as Token;

    if (!target.actor?.id) {
      ABFDialogs.prompt('Target do not have any actor associated');
      return;
    }

    if (this.character?.id) {
      await ABFDialogs.confirm('Confirm attack', `Do you want to attack ${target.actor.name}?`, {
        onConfirm: () => {
          if (this.character?.id && target.actor?.id) {
            const msg: UserRequestToAttackMessage = {
              type: UserMessageTypes.RequestToAttack,
              senderId: user.id,
              payload: { attackerId: this.character.id, defenderId: target.actor.id }
            };

            this.emit(msg);

            this.attackDialog = new CombatAttackDialog(this.character!, target.actor, {
              onAttack: result => {
                const newMsg: UserAttackMessage = {
                  type: UserMessageTypes.Attack,
                  payload: result
                };

                this.emit(newMsg);
              }
            });
          }
        }
      });
    } else {
      ABFDialogs.prompt("You don't have selected any character");
    }
  }

  private async manageCounterAttack(msg: GMCounterAttackMessage) {
    const { attackerId, defenderId } = msg.payload;

    if (this.actor.id !== attackerId) {
      return;
    }

    const attacker = this.actor;
    const defender = this.findActorById(defenderId);

    this.attackDialog = new CombatAttackDialog(
      attacker,
      defender,
      {
        onAttack: result => {
          const newMsg: UserAttackMessage = {
            type: UserMessageTypes.Attack,
            payload: result
          };

          this.emit(newMsg);
        }
      },
      true
    );
  }

  private async manageAttackRequestResponse(msg: GMRequestToAttackResponseMessage) {
    if (msg.toUserId !== this.user.id) return;

    if (!this.attackDialog) return;

    if (msg.payload.allowed) {
      this.attackDialog.updatePermissions(msg.payload.allowed);
    } else {
      this.endCombat();

      new PromptDialog(
        `Your attack request have been rejected. ${
          msg.payload.alreadyInACombat
            ? 'GM is already involved in a combat, wait your turn and try to attack again.'
            : ''
        }`
      );
    }
  }

  private async manageDefend(msg: GMAttackMessage) {
    const { result, attackerId, defenderId } = msg.payload;

    if (this.actor.id !== defenderId) {
      return;
    }

    const attacker = this.findActorById(attackerId);
    const defender = this.actor;

    try {
      this.defenseDialog = new CombatDefenseDialog(
        {
          actor: attacker,
          attackType: result.type,
          critic: result.type === 'combat' ? result.values.criticSelected : undefined
        },
        defender,
        {
          onDefense: res => {
            const newMsg: UserDefendMessage = {
              type: UserMessageTypes.Defend,
              payload: res
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
