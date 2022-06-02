import { Log } from '../../../../../utils/Log';
import { WSCombatManager } from '../WSCombatManager';
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
import { getTargetToken } from '../util/getTargetToken';
import { assertCurrentScene } from '../util/assertCurrentScene';
import { assertGMActive } from '../util/assertGMActive';
import { getSelectedToken } from '../util/getSelectedToken';

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

  endCombat() {
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

  get user(): User {
    return this.game.user!;
  }

  private isMyToken(tokenId: string): boolean {
    return this.game.canvas.tokens?.ownedTokens.filter(tk => tk.id === tokenId).length === 1;
  }

  public async sendAttackRequest() {
    assertGMActive();
    assertCurrentScene();

    if (!this.user) return;

    const attackerToken = getSelectedToken(this.game);
    const { targets } = this.user;

    const targetTokens = getTargetToken(attackerToken, targets);

    await ABFDialogs.confirm(
      this.game.i18n.format('macros.combat.dialog.attackConfirm.title'),
      this.game.i18n.format('macros.combat.dialog.attackConfirm.body.title', { target: targetTokens[0].name }),
      {
        onConfirm: () => {
          if (attackerToken?.id && targetTokens?.every(t=> { return t?.id })) {
            const msg: UserRequestToAttackMessage = {
              type: UserMessageTypes.RequestToAttack,
              senderId: this.user.id!,
              payload: { attackerTokenId: attackerToken.id, defenderTokenId: targetTokens.map(t=> {return t.id ?? ""}) }
            };
            this.emit(msg);
            this.attackDialog = new CombatAttackDialog(attackerToken!, targetTokens!, {
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
  }
  private async manageCounterAttack(msg: GMCounterAttackMessage) {
    const { attackerTokenId, defenderTokenId } = msg.payload;

    if (!this.isMyToken(attackerTokenId)) {
      return;
    }

    const attacker = this.findTokenById(attackerTokenId);
    const defender = this.findTokenById(defenderTokenId);

    this.attackDialog = new CombatAttackDialog(
      attacker,
      [defender],
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
    const { result, attackerTokenId, defenderTokenId } = msg.payload;

    if (!this.isMyToken(defenderTokenId)) {
      return;
    }

    const attacker = this.findTokenById(attackerTokenId);
    const defender = this.findTokenById(defenderTokenId);

    try {
      this.defenseDialog = new CombatDefenseDialog(
        {
          token: attacker,
          attackType: result.type,
          critic: result.values.critic
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
