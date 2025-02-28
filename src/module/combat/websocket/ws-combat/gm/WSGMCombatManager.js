import { Logger } from '../../../../../utils';
import { WSCombatManager } from '../WSCombatManager';
import { GMMessageTypes } from './WSGMCombatMessageTypes';
import { UserMessageTypes } from '../user/WSUserCombatMessageTypes';
import { CombatDialogs } from '../../dialogs/CombatDialogs';
import { ABFDialogs } from '../../../../dialogs/ABFDialogs';
import { canOwnerReceiveMessage } from '../util/canOwnerReceiveMessage';
import { getTargetToken } from '../util/getTargetToken';
import { assertCurrentScene } from '../util/assertCurrentScene';
import { ABFSettingsKeys } from '../../../../../utils/registerSettings';
import ResultsDialog from '@module/combat/ResultsDialog.svelte';
import { SvelteApplication } from '@svelte/SvelteApplication.svelte';
import { Attack, AttackDialog } from '@module/combat/attack';
import { Defense, DefenseDialog } from '@module/combat/defense';

export class WSGMCombatManager extends WSCombatManager {
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
        Logger.warn('Unknown message', msg);
    }
  }

  async manageUserAttack(msg) {
    let attack = Attack.fromJSON(msg.payload);
    this.manageAttack(attack, msg);
  }

  /** @param {Attack} attack */
  manageAttack(attack) {
    if (this.combat) {
      this.combat.props.attack = attack;

      const { attackerToken, defenderToken, defender } = attack;

      if (canOwnerReceiveMessage(defender)) {
        const newMsg = {
          type: GMMessageTypes.Attack,
          payload: {
            attackerTokenId: attackerToken.id,
            defenderTokenId: defenderToken.id,
            result: attack
          }
        };

        this.emit(newMsg);
      } else {
        try {
          this.manageDefense(attackerToken, defenderToken, attack);
        } catch (err) {
          if (err) {
            Logger.error(err);
          }

          this.endCombat();
        }
      }
    } else {
      Logger.warn('User attack received but none combat is running');
    }
  }

  manageUserDefense(msg) {
    if (this.combat) {
      let defense = Defense.fromJSON(msg.payload);
      this.combat.props.defense = defense;
    } else {
      Logger.warn('User attack received but none combat is running');
    }
  }

  endCombat() {
    if (this.combat) {
      const msg = {
        type: GMMessageTypes.CancelCombat,
        combatId: this.combat.id
      };

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

  async sendAttack() {
    assertCurrentScene();

    const { user } = this.game;

    if (!user) return;

    const { targets } = user;

    const selectedToken = this.game.scenes?.current?.tokens.find(
      t => t.object?.controlled
    );

    if (!selectedToken) {
      ABFDialogs.prompt(
        this.game.i18n.localize('macros.combat.dialog.error.noSelectedToken.title')
      );
      return;
    }

    const targetToken = getTargetToken(selectedToken, targets);

    if (selectedToken?.id) {
      await ABFDialogs.confirm(
        this.game.i18n.format('macros.combat.dialog.attackConfirm.title'),
        this.game.i18n.format('macros.combat.dialog.attackConfirm.body.title', {
          target: targetToken.name
        }),
        {
          onConfirm: () => {
            if (selectedToken?.id && targetToken?.id) {
              this.combat = this.createNewCombat(selectedToken, targetToken);

              this.manageGMAttack(selectedToken, targetToken);
            }
          }
        }
      );
    } else {
      ABFDialogs.prompt(
        this.game.i18n.localize('macros.combat.dialog.error.noSelectedActor.title')
      );
    }
  }

  async manageUserAttackRequest(msg) {
    if (this.combat) {
      const newMsg = {
        type: GMMessageTypes.RequestToAttackResponse,
        toUserId: msg.senderId,
        payload: {
          allowed: false,
          alreadyInACombat: true
        }
      };

      this.emit(newMsg);
      return;
    }

    const { attackerTokenId, defenderTokenId } = msg.payload;

    const attacker = this.findTokenById(attackerTokenId);
    const defender = this.findTokenById(defenderTokenId);

    if (!attacker || !defender) {
      Logger.warn(
        'Can not handle user attack request due attacker or defender actor do not exist'
      );
      return;
    }

    try {
      if (
        !this.game.settings.get('animabf', ABFSettingsKeys.AUTO_ACCEPT_COMBAT_REQUESTS)
      ) {
        await CombatDialogs.openCombatRequestDialog({
          attacker: attacker.actor,
          defender: defender.actor
        });
      }

      this.combat = this.createNewCombat(attacker, defender);

      const newMsg = {
        type: GMMessageTypes.RequestToAttackResponse,
        toUserId: msg.senderId,
        payload: { allowed: true }
      };

      this.emit(newMsg);
    } catch (err) {
      if (err) {
        Logger.error(err);
      }

      const newMsg = {
        type: GMMessageTypes.RequestToAttackResponse,
        toUserId: msg.senderId,
        payload: { allowed: false }
      };

      this.emit(newMsg);
    }
  }

  /**
   * @param {TokenDocument} attacker
   * @param {TokenDocument} defender
   * @param {number} [counterAttackBonus]
   */
  createNewCombat(attacker, defender, counterAttackBonus) {
    const attack = new Attack(attacker, defender, counterAttackBonus);
    let resultsApp = new SvelteApplication(
      ResultsDialog,
      {
        attack,
        defense: new Defense(attack),
        onClose: () => {
          this.endCombat();
        },
        onCounterAttack: counterAttackBonus
          ? (/** @type {number} */ bonus) => {
              this.endCombat();

              this.combat = this.createNewCombat(defender, attacker, bonus);

              if (canOwnerReceiveMessage(defender.actor)) {
                const newMsg = {
                  type: GMMessageTypes.CounterAttack,
                  payload: {
                    attackerTokenId: defender.id,
                    defenderTokenId: attacker.id,
                    counterAttackBonus: bonus
                  }
                };

                this.emit(newMsg);
              } else {
                this.manageGMAttack(defender, attacker, bonus);
              }
            }
          : undefined
      },
      { frameless: true }
    );
    resultsApp.render(true);
    return resultsApp;
  }

  manageGMAttack(attacker, defender, bonus) {
    this.attackDialog = new SvelteApplication(
      AttackDialog,
      {
        attacker,
        defender,
        onAttack: attack => {
          this.attackDialog?.close({ force: true });

          this.attackDialog = undefined;
          this.manageAttack(attack);
        },
        counterAttackBonus: bonus
      },
      { frameless: true }
    );
    this.attackDialog.render(true);
  }

  manageDefense(attacker, defender, attack) {
    this.defendDialog = new SvelteApplication(
      DefenseDialog,
      {
        attack,
        onDefend: defense => {
          this.defendDialog?.close({ force: true });

          this.defendDialog = undefined;

          if (this.combat) {
            this.combat.props.defense = defense;
          }
        }
      },
      { frameless: true }
    );
    this.defendDialog.render(true);
  }
}
