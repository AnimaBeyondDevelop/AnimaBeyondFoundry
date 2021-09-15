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
      ABFDialogs.prompt(this.game.i18n.localize('macros.combat.dialog.error.oneTarget.title'));
      return;
    }

    if (targets.ids.length > 1) {
      ABFDialogs.prompt(this.game.i18n.localize('macros.combat.dialog.error.multipleTargets.title'));
      return;
    }

    const target = targets.values().next().value as Token;

    if (!target.actor?.id) {
      ABFDialogs.prompt(this.game.i18n.localize('macros.combat.dialog.error.withoutActor.title'));
      return;
    }

    if (this.character?.id) {
      await ABFDialogs.confirm(
        this.game.i18n.format('macros.combat.dialog.attackConfirm.title'),
        this.game.i18n.format('macros.combat.dialog.attackConfirm.body.title', { target: target.actor.name }),
        {
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
        }
      );
    } else {
      ABFDialogs.prompt(this.game.i18n.localize('macros.combat.dialog.error.noSelectedActor.title'));
    }
  }

  private async manageCounterAttack(msg: GMCounterAttackMessage) {
    const { attackerId, defenderId } = msg.payload;

    if (this.character?.id !== attackerId) {
      return;
    }

    const attacker = this.character;
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
      { allowed: true, counterAttackBonus: msg.payload.counterAttackBonus }
    );
  }

  private async manageAttackRequestResponse(msg: GMRequestToAttackResponseMessage) {
    if (msg.toUserId !== this.user.id) return;

    if (!this.attackDialog) return;

    if (msg.payload.allowed) {
      this.attackDialog.updatePermissions(msg.payload.allowed);
    } else {
      this.endCombat();

      if (msg.payload.alreadyInACombat) {
        new PromptDialog(this.game.i18n.localize('macros.combat.dialog.error.alreadyInCombat.title'));
      } else {
        new PromptDialog(this.game.i18n.localize('macros.combat.dialog.error.requestRejected.title'));
      }
    }
  }

  private async manageDefend(msg: GMAttackMessage) {
    const { result, attackerId, defenderId } = msg.payload;

    if (this.character?.id !== defenderId) {
      return;
    }

    const attacker = this.findActorById(attackerId);
    const defender = this.character;

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
