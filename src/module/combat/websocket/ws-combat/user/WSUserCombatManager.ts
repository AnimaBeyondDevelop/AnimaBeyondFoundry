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

  get token(): TokenDocument {
    if (!this.user.character?.id) {
      const message = this.game.i18n.localize('macros.combat.dialog.error.noSelectedActor.title');
      ABFDialogs.prompt(message);

      throw new Error(message);
    }

    const token = this.game.scenes?.current?.tokens.find(t => t.data.actorId === this.user.character!.id);

    if (!token?.id) {
      const message = this.game.i18n.localize('macros.combat.dialog.error.noTokenInCurrentScene.title');
      ABFDialogs.prompt(message);

      throw new Error(message);
    }

    return token;
  }

  private isMyToken(tokenId): boolean {
    return this.token.id === tokenId;
  }

  public async sendAttackRequest() {
    assertGMActive();
    assertCurrentScene();

    const { user } = this.game;

    if (!user) return;

    const { targets } = user;

    const targetToken = getTargetToken(this.token, targets);

    await ABFDialogs.confirm(
      this.game.i18n.format('macros.combat.dialog.attackConfirm.title'),
      this.game.i18n.format('macros.combat.dialog.attackConfirm.body.title', { target: targetToken.name }),
      {
        onConfirm: () => {
          if (this.token?.id && targetToken.id) {
            const msg: UserRequestToAttackMessage = {
              type: UserMessageTypes.RequestToAttack,
              senderId: user.id,
              payload: { attackerTokenId: this.token.id, defenderTokenId: targetToken.id }
            };
            this.emit(msg);
            this.attackDialog = new CombatAttackDialog(this.token!, targetToken!, {
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

    const attacker = this.token;
    const defender = this.findTokenById(defenderTokenId);

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
    const { result, attackerTokenId, defenderTokenId } = msg.payload;

    if (!this.isMyToken(defenderTokenId)) {
      return;
    }

    const attacker = this.findTokenById(attackerTokenId);
    const defender = this.token;

    try {
      this.defenseDialog = new CombatDefenseDialog(
        {
          token: attacker,
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
