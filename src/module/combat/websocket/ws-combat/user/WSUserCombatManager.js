import { Logger } from '../../../../../utils';
import { WSCombatManager } from '../WSCombatManager';
import { GMMessageTypes } from '../gm/WSGMCombatMessageTypes';
import { UserMessageTypes } from './WSUserCombatMessageTypes';
import { PromptDialog } from '../../../../dialogs/PromptDialog';
import { ABFDialogs } from '../../../../dialogs/ABFDialogs';
import { getTargetToken } from '../util/getTargetToken';
import { assertCurrentScene } from '../util/assertCurrentScene';
import { assertGMActive } from '../util/assertGMActive';
import { getSelectedToken } from '../util/getSelectedToken';
import { SvelteApplication } from '@svelte/SvelteApplication.svelte';
import { Attack, AttackDialog } from '@module/combat/attack';
import { DefenseDialog } from '@module/combat/defense';

export class WSUserCombatManager extends WSCombatManager {
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
        Logger.warn('Unknown message', msg);
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

  manageCancelCombat() {
    this.endCombat();
  }

  get user() {
    return this.game.user;
  }

  isMyToken(tokenId) {
    return (
      this.game.canvas.tokens?.ownedTokens.filter(tk => tk.id === tokenId).length === 1
    );
  }

  async sendAttackRequest() {
    assertGMActive();
    assertCurrentScene();

    if (!this.user) return;

    const attackerToken = getSelectedToken(this.game);
    const { targets } = this.user;

    const targetToken = getTargetToken(attackerToken, targets);

    await ABFDialogs.confirm(
      this.game.i18n.format('macros.combat.dialog.attackConfirm.title'),
      this.game.i18n.format('macros.combat.dialog.attackConfirm.body.title', {
        target: targetToken.name
      }),
      {
        onConfirm: () => {
          if (attackerToken?.id && targetToken.id) {
            const msg = {
              type: UserMessageTypes.RequestToAttack,
              senderId: this.user.id,
              payload: {
                attackerTokenId: attackerToken.id,
                defenderTokenId: targetToken.id
              }
            };
            this.emit(msg);
            this.attackDialog = new SvelteApplication(
              AttackDialog,
              {
                attacker: attackerToken,
                defender: targetToken,
                onAttack: result => {
                  const newMsg = {
                    type: UserMessageTypes.Attack,
                    payload: result
                  };
                  this.emit(newMsg);
                  this.attackDialog.close();
                  this.attackDialog = undefined;
                }
              },
              { frameless: true }
            );
          }
        }
      }
    );
  }

  async manageCounterAttack(msg) {
    const { attackerTokenId, defenderTokenId } = msg.payload;

    if (!this.isMyToken(attackerTokenId)) {
      return;
    }

    const attacker = this.findTokenById(attackerTokenId);
    const defender = this.findTokenById(defenderTokenId);

    this.attackDialog = new SvelteApplication(
      AttackDialog,
      {
        attacker,
        defender,
        onAttack: result => {
          const newMsg = {
            type: UserMessageTypes.Attack,
            payload: result
          };

          this.emit(newMsg);
          this.attackDialog.close();
          this.attackDialog = undefined;
        },
        counterAttackBonus: msg.payload.counterAttackBonus
      },
      { frameless: true }
    );
    this.attackDialog.render(true);
  }

  async manageAttackRequestResponse(msg) {
    if (msg.toUserId !== this.user.id) return;

    if (!this.attackDialog) return;

    if (msg.payload.allowed) {
      this.attackDialog.render(true);
    } else {
      this.endCombat();

      if (msg.payload.alreadyInACombat) {
        new PromptDialog(
          this.game.i18n.localize('macros.combat.dialog.error.alreadyInCombat.title')
        );
      } else {
        new PromptDialog(
          this.game.i18n.localize('macros.combat.dialog.error.requestRejected.title')
        );
      }
    }
  }

  async manageDefend(msg) {
    try {
      const attack = Attack.fromJSON(msg.payload);

      this.defenseDialog = new SvelteApplication(
        DefenseDialog,
        {
          attack,
          onDefend: defense => {
            const newMsg = {
              type: UserMessageTypes.Defend,
              payload: defense
            };

            this.emit(newMsg);
            this.defenseDialog.close();
            this.defenseDialog = undefined;
          }
        },
        { frameless: true }
      );
      this.defenseDialog.render(true);
    } catch (err) {
      if (err) {
        Logger.error(err);
      }

      this.endCombat();
    }
  }
}
