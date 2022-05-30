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
import { CombatAttackDialog, UserCombatAttackResult } from '../../../../dialogs/combat/CombatAttackDialog';
import { ABFDialogs } from '../../../../dialogs/ABFDialogs';
import { canOwnerReceiveMessage } from '../util/canOwnerReceiveMessage';
import { OptionalWeaponCritic } from '../../../../types/combat/WeaponItemConfig';
import { getTargetToken } from '../util/getTargetToken';
import { assertCurrentScene } from '../util/assertCurrentScene';
import { ABFSettingsKeys } from '../../../../../utils/registerSettings';

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

      const { attackerToken, defenderToken, defenderActor } = this.combat;

      const { critic } = msg.payload.values;

      if (canOwnerReceiveMessage(defenderActor)) {
        const newMsg: GMAttackMessage = {
          type: GMMessageTypes.Attack,
          payload: { attackerTokenId: attackerToken.id!, defenderTokenId: defenderToken.id!, result: msg.payload }
        };

        this.emit(newMsg);
      } else {
        try {
          this.manageDefense(attackerToken, defenderToken, msg.payload.type, critic);
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

  endCombat() {
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
    assertCurrentScene();

    const { user } = this.game;

    if (!user) return;

    const { targets } = user;

    const selectedToken = this.game.scenes?.current?.tokens.find(t => (t.object as any)?._controlled);

    if (!selectedToken) {
      ABFDialogs.prompt(this.game.i18n.localize('macros.combat.dialog.error.noSelectedToken.title'));
      return;
    }

    const targetTokens = getTargetToken(selectedToken, targets);

    if (selectedToken?.id) {
      await ABFDialogs.confirm(
        this.game.i18n.format('macros.combat.dialog.attackConfirm.title'),
        this.game.i18n.format('macros.combat.dialog.attackConfirm.body.title', { target: targetTokens[0]?.name }),
        {
          onConfirm: () => {
            if (selectedToken?.id && targetTokens?.every(t=> { return t?.id })) {
              this.combat = this.createNewCombat(selectedToken!, targetTokens);

              this.manageAttack(selectedToken!, targetTokens);
            }
          }
        }
      );
    } else {
      ABFDialogs.prompt(this.game.i18n.localize('macros.combat.dialog.error.noSelectedActor.title'));
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

    const { attackerTokenId, defenderTokenId } = msg.payload;

    const attacker = this.findTokenById(attackerTokenId);
    const defender = defenderTokenId.map(id=> { return this.findTokenById(id) });

    if (!attacker || !defender) {
      Log.warn('Can not handle user attack request due attacker or defender actor do not exist');
      return;
    }

    try {
      if (!this.game.settings.get('animabf', ABFSettingsKeys.AUTO_ACCEPT_COMBAT_REQUESTS)) {
        await CombatDialogs.openCombatRequestDialog({ attacker: attacker.actor!, defender: defender[0].actor! });
      }

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

  private createNewCombat(attacker: TokenDocument, defenders: Array<TokenDocument>) {
    return new GMCombatDialog(attacker, defenders, {
      onClose: () => {
        this.endCombat();
      },
      onCounterAttack: (defender, bonus) => {
        this.endCombat();

        this.combat = new GMCombatDialog(
          defender,
          [attacker],
          {
            onClose: () => {
              this.endCombat();
            },
            onCounterAttack: () => {
              this.endCombat();
            }
          },
          { isCounter: true, counterAttackBonus: bonus }
        );

        if (canOwnerReceiveMessage(defender.actor!)) {
          const newMsg: GMCounterAttackMessage = {
            type: GMMessageTypes.CounterAttack,
            payload: { attackerTokenId: defender.id!, defenderTokenId: attacker.id!, counterAttackBonus: bonus }
          };

          this.emit(newMsg);
        } else {
          this.manageAttack(defender, [attacker], bonus);
        }
      }
    });
  }

  private manageAttack(attacker: TokenDocument, defenders: Array<TokenDocument>, bonus?: number) {
    this.attackDialog = new CombatAttackDialog(
      attacker,
      defenders,
      {
        onAttack: result => {
          defenders.forEach(defender=> {
            this.attackDialog?.close({ force: true });

            this.attackDialog = undefined;

            if (this.combat) {
              this.combat.updateAttackerData(result);

              if (canOwnerReceiveMessage(defender.actor!)) {
                const newMsg: GMAttackMessage = {
                  type: GMMessageTypes.Attack,
                  payload: { attackerTokenId: attacker.id!, defenderTokenId: defender.id!, result }
                };

                this.emit(newMsg);
              } else {
                const { critic } = result.values;

                try {
                  this.manageDefense(attacker, defender, result.type, critic);
                } catch (err) {
                  if (err) {
                    Log.error(err);
                  }

                  this.endCombat();
                }
              }
            }
          });
        }
      },
      { counterAttackBonus: bonus }
    );
  }

  private manageDefense(
    attacker: TokenDocument,
    defender: TokenDocument,
    attackType: UserCombatAttackResult['type'],
    critic?: OptionalWeaponCritic
  ) {
    this.defendDialog = new CombatDefenseDialog({ token: attacker, attackType, critic }, defender, {
      onDefense: result => {
        if (this.defendDialog) {
          this.defendDialog.close({ force: true });

          this.defendDialog = undefined;

          if (this.combat) {
            this.combat.updateDefenderData(result);
          }
        }
      }
    });
  }
}
