import { Log } from '../../../../../utils/Log';
import { WSCombatManager } from '../WSCombatManager';
import {
  ABFWSGMNotification,
  ABFWSGMRequest,
  GMAttackMessage,
  GMCancelCombatMessage,
  GMCounterAttackMessage,
  GMMessageTypes,
  GMRequestToAttackResponseMessage
} from './WSGMCombatMessageTypes';
import {
  UserAttackMessage,
  UserDefendMessage,
  UserMessageTypes,
  UserRequestToAttackMessage
} from '../user/WSUserCombatMessageTypes';
import { GMCombatDialog } from '../../../../dialogs/combat/GMCombatDialog';
import { CombatDialogs } from '../../dialogs/CombatDialogs';
import { CombatDefenseDialog } from '../../../../dialogs/combat/CombatDefenseDialog';
import { CombatAttackDialog } from '../../../../dialogs/combat/CombatAttackDialog';
import { ABFActor } from '../../../../actor/ABFActor';
import { ABFDialogs } from '../../../../dialogs/ABFDialogs';

export class WSGMCombatManager extends WSCombatManager<ABFWSGMRequest, ABFWSGMNotification> {
  private combat: GMCombatDialog | undefined;

  private attackDialog: CombatAttackDialog | undefined;
  private defendDialog: CombatDefenseDialog | undefined;

  public constructor(game: Game) {
    super(game);
  }

  receive(msg) {
    switch (msg.type) {
      case UserMessageTypes.RequestToAttack:
        this.manageUserAttackRequest(msg);
        break;
      case UserMessageTypes.Attack:
        this.manageUserAttack(msg);
        break;
      case UserMessageTypes.Defend:
        this.manageUserDefense(msg);
        break;
      default:
        Log.warn('Unknown message', msg);
    }
  }

  private async manageUserAttack(msg: UserAttackMessage) {
    if (this.combat) {
      this.combat.updateAttackerData(msg.payload);

      const { attacker, defender } = this.combat;

      const critic = msg.payload.type === 'combat' ? msg.payload.values.criticSelected : undefined;

      if (defender.hasPlayerOwner) {
        const newMsg: GMAttackMessage = {
          type: GMMessageTypes.Attack,
          payload: { attackerId: attacker.id!, defenderId: defender.id!, result: msg.payload }
        };

        this.emit(newMsg);
      } else {
        try {
          this.defendDialog = new CombatDefenseDialog(
            { actor: attacker, attackType: msg.payload.type, critic },
            defender,
            {
              onDefense: result => {
                if (this.defendDialog) {
                  this.defendDialog.close({ force: true });

                  this.defendDialog = undefined;

                  if (this.combat) {
                    this.combat.updateDefenderData(result);
                  }
                }
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
    } else {
      Log.warn('User attack received but none combat is running');
    }
  }

  private manageUserDefense(msg: UserDefendMessage) {
    if (this.combat) {
      this.combat.updateDefenderData(msg.payload);
    } else {
      Log.warn('User attack received but none combat is running');
    }
  }

  private endCombat() {
    if (this.combat) {
      const msg: GMCancelCombatMessage = { type: GMMessageTypes.CancelCombat, combatId: this.combat.id };

      this.emit(msg);

      this.combat.close({ executeHook: false });

      this.combat = undefined;
    }

    if (this.defendDialog) {
      this.defendDialog.close({ force: true });

      this.defendDialog = undefined;
    }

    if (this.attackDialog) {
      this.attackDialog.close({ force: true });

      this.attackDialog = undefined;
    }
  }

  public async sendAttack() {
    const { user } = this.game;

    if (!user) return;

    const { targets } = user;

    const selectedActor = this.game.scenes?.current?.tokens.find(t => (t.object as any)?._controlled)?.actor;

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

    if (selectedActor?.id) {
      await ABFDialogs.confirm('Confirm attack', `Do you want to attack ${target.actor.name}?`, {
        onConfirm: () => {
          if (selectedActor?.id && target.actor?.id) {
            this.combat = this.createNewCombat(selectedActor!, target.actor);

            this.attackDialog = new CombatAttackDialog(selectedActor!, target.actor, {
              onAttack: result => {
                this.combat?.updateAttackerData(result);

                this.attackDialog?.close({ force: true });
                this.attackDialog = undefined;

                const newMsg: GMAttackMessage = {
                  type: GMMessageTypes.Attack,
                  payload: {
                    attackerId: selectedActor!.id!,
                    defenderId: target.actor!.id!,
                    result
                  }
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

  private async manageUserAttackRequest(msg: UserRequestToAttackMessage) {
    if (this.combat) {
      const newMsg: GMRequestToAttackResponseMessage = {
        type: GMMessageTypes.RequestToAttackResponse,
        toUserId: msg.senderId,
        payload: { allowed: false, alreadyInACombat: true }
      };

      this.emit(newMsg);
      return;
    }

    const { attackerId, defenderId } = msg.payload;

    const attacker = this.findActorById(attackerId);
    const defender = this.findActorById(defenderId);

    if (!attacker || !defender) {
      Log.warn('Can not handle user attack request due attacker or defender actor do not exist');
      return;
    }

    try {
      await CombatDialogs.openCombatRequestDialog({ attacker, defender });

      this.combat = this.createNewCombat(attacker, defender);

      const newMsg: GMRequestToAttackResponseMessage = {
        type: GMMessageTypes.RequestToAttackResponse,
        toUserId: msg.senderId,
        payload: { allowed: true }
      };

      this.emit(newMsg);
    } catch (err) {
      if (err) {
        Log.error(err);
      }

      const newMsg: GMRequestToAttackResponseMessage = {
        type: GMMessageTypes.RequestToAttackResponse,
        toUserId: msg.senderId,
        payload: { allowed: false }
      };

      this.emit(newMsg);
    }
  }

  private createNewCombat(attacker: ABFActor, defender: ABFActor) {
    return new GMCombatDialog(attacker, defender, {
      onClose: () => {
        this.endCombat();
      },
      onCounterAttack: () => {
        this.endCombat();

        this.combat = new GMCombatDialog(
          defender,
          attacker,
          {
            onClose: () => {
              this.endCombat();
            },
            onCounterAttack: () => {
              this.endCombat();
            }
          },
          true
        );

        if (defender.hasPlayerOwner) {
          const newMsg: GMCounterAttackMessage = {
            type: GMMessageTypes.CounterAttack,
            payload: { attackerId: defender.id!, defenderId: attacker.id! }
          };

          this.emit(newMsg);
        } else {
          this.attackDialog = new CombatAttackDialog(defender, attacker, {
            onAttack: result => {
              this.attackDialog?.close({ force: true });

              this.attackDialog = undefined;

              if (this.combat) {
                this.combat.updateAttackerData(result);

                const newMsg: GMAttackMessage = {
                  type: GMMessageTypes.Attack,
                  payload: { attackerId: defender.id!, defenderId: attacker.id!, result }
                };

                this.emit(newMsg);
              }
            }
          });
        }
      }
    });
  }
}
