import { Log } from '../../../../../utils/Log';
import { WSCombatManager } from '../WSCombatManager';
import {
  ABFWSGMNotification,
  ABFWSGMRequest,
  GMAttackMessage,
  GMCancelCombatMessage,
  GMMessageTypes,
  GMRequestToAttackResponseMessage
} from './WSGMCombatMessageTypes';
import {
  UserAttackMessage,
  UserDefendMessage,
  UserMessageTypes,
  UserRequestToAttackMessage
} from '../user/WSUserCombatMessageTypes';
import { GMCombatDialog } from '../../dialogs/GMCombatDialog';
import { CombatDialogs } from '../../dialogs/CombatDialogs';
import { UserCombatDefenseDialog } from '../../dialogs/UserCombatDefenseDialog';

export class WSGMCombatManager extends WSCombatManager<ABFWSGMRequest, ABFWSGMNotification> {
  private combat: GMCombatDialog | undefined;

  private defendDialog: UserCombatDefenseDialog | undefined;

  private processingRequest = false;

  public constructor(game: Game) {
    super(game);
  }

  receive(msg) {
    if (msg.combatId && (!this.combat || this.combat.id !== msg.combatId)) {
      // The message is not for us
      return;
    }

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
      this.combat.updateAttackerData(msg.payload.attackValue, msg.payload.damageValue);

      const { attacker, defender } = this.combat;

      if (defender.hasPlayerOwner) {
        const newMsg: GMAttackMessage = {
          type: GMMessageTypes.Attack,
          combatId: this.combat.id,
          payload: {
            attackerId: attacker.id!,
            defenderId: defender.id!,
            critic: msg.payload.critic
          }
        };

        this.emit(newMsg);
      } else {
        try {
          this.defendDialog = new UserCombatDefenseDialog(
            {
              attacker: { actor: attacker, critic: msg.payload.critic },
              defender: { actor: defender }
            },
            {
              onDefense: defenseValues => {
                if (this.defendDialog) {
                  this.defendDialog.close({ force: true });

                  this.defendDialog = undefined;

                  if (this.combat) {
                    this.combat.updateDefenderData(defenseValues.defense, defenseValues.at);
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
      this.combat.updateDefenderData(msg.payload.defenseValue, msg.payload.atValue);
    } else {
      Log.warn('User attack received but none combat is running');
    }
  }

  private endCombat() {
    if (this.combat) {
      const msg: GMCancelCombatMessage = { type: GMMessageTypes.CancelCombat, combatId: this.combat.id };

      this.emit(msg);

      this.combat = undefined;
    }

    if (this.defendDialog) {
      this.defendDialog.close({ force: true });

      this.defendDialog = undefined;
    }
  }

  private async manageUserAttackRequest(msg: UserRequestToAttackMessage) {
    if (this.processingRequest) {
      const newMsg: GMRequestToAttackResponseMessage = {
        type: GMMessageTypes.RequestToAttackResponse,
        payload: { allowed: false, alreadyInACombat: true }
      };

      this.emit(newMsg);
      return;
    }

    this.processingRequest = true;

    const { attackerId, defenderId } = msg.payload;

    const attacker = this.findActorById(attackerId);
    const defender = this.findActorById(defenderId);

    if (!attacker || !defender) {
      Log.warn('Can not handle user attack request due attacker or defender actor do not exist');
      return;
    }

    try {
      await CombatDialogs.openCombatRequestDialog({ attacker, defender });

      this.combat = new GMCombatDialog(
        {
          attacker: { actor: this.findActorById(attackerId) },
          defender: { actor: this.findActorById(defenderId) }
        },
        {
          onClose: () => {
            this.endCombat();
          }
        }
      );

      this.processingRequest = false;

      const newMsg: GMRequestToAttackResponseMessage = {
        type: GMMessageTypes.RequestToAttackResponse,
        combatId: this.combat.id,
        payload: { allowed: true }
      };

      this.emit(newMsg);
    } catch (err) {
      if (err) {
        Log.error(err);
      }

      const newMsg: GMRequestToAttackResponseMessage = {
        type: GMMessageTypes.RequestToAttackResponse,
        payload: { allowed: false }
      };

      this.emit(newMsg);
    } finally {
      this.processingRequest = false;
    }
  }
}
