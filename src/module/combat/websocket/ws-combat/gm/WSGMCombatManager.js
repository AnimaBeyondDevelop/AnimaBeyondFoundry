import { Log } from '../../../../../utils/Log';
import { WSCombatManager } from '../WSCombatManager';
import { GMMessageTypes } from './WSGMCombatMessageTypes';
import { UserMessageTypes } from '../user/WSUserCombatMessageTypes';
import { GMCombatDialog } from '../../../../dialogs/combat/GMCombatDialog';
import { CombatDialogs } from '../../dialogs/CombatDialogs';
import { CombatDefenseDialog } from '../../../../dialogs/combat/CombatDefenseDialog';
import { CombatAttackDialog } from '../../../../dialogs/combat/CombatAttackDialog';
import { RollRequestDialog } from '../../../../dialogs/combat/RollRequestDialog';
import { ABFDialogs } from '../../../../dialogs/ABFDialogs';
import { canOwnerReceiveMessage } from '../util/canOwnerReceiveMessage';
import { getTargetToken } from '../util/getTargetToken';
import { assertCurrentScene } from '../util/assertCurrentScene';
import { ABFSettingsKeys } from '../../../../../utils/registerSettings';

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
      case UserMessageTypes.Roll:
        this.manageUserRoll(msg);
        break;
      default:
        Log.warn('Unknown message', msg);
    }
  }

  async manageUserAttack(msg) {
    if (this.combat) {
      this.combat.updateAttackerData(msg.payload);

      const { attackerToken, defenderToken, defenderActor } = this.combat;

      const { critic } = msg.payload.values;
      const { visible } = msg.payload.values;
      const { projectile } = msg.payload.values;
      const { damage } = msg.payload.values;
      const { distance } = msg.payload.values;
      const { specialPorpuseAttack } = msg.payload.values;

      if (canOwnerReceiveMessage(defenderActor)) {
        const newMsg = {
          type: GMMessageTypes.Attack,
          payload: {
            attackerTokenId: attackerToken.id,
            defenderTokenId: defenderToken.id,
            result: msg.payload
          }
        };

        this.emit(newMsg);
      } else {
        try {
          this.manageDefense(
            attackerToken,
            defenderToken,
            msg.payload.type,
            critic,
            visible,
            projectile,
            damage,
            distance
            , specialPorpuseAttack);
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

  manageUserDefense(msg) {
    if (this.combat) {
      this.combat.updateDefenderData(msg.payload);
    } else {
      Log.warn('User defend received but none combat is running');
    }
  }

  manageUserRoll(msg) {
    if (this.combat) {
      this.combat.updateRollData(msg.payload);
    } else {
      Log.warn('User roll received but none combat is running');
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

    if (this.rollRequestDialog) {
      this.rollRequestDialog.close({ force: true });

      this.rollRequestDialog = undefined;
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

              this.manageAttack(selectedToken, targetToken);
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
      Log.warn(
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
        Log.error(err);
      }

      const newMsg = {
        type: GMMessageTypes.RequestToAttackResponse,
        toUserId: msg.senderId,
        payload: { allowed: false }
      };

      this.emit(newMsg);
    }
  }

  createNewCombat(attacker, defender) {
    return new GMCombatDialog(attacker, defender, {
      onClose: () => {
        this.endCombat();
      },
      onCounterAttack: bonus => {
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
          {
            isCounter: true,
            counterAttackBonus: bonus
          }
        );

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
          this.manageAttack(defender, attacker, bonus);
        }
      },
      onRollRequest: (token, roll) => {
        if (this.rollRequestDialog) {
          Log.warn(
            'Token is already in a Roll Check'
          );
          return;
        }
        if (canOwnerReceiveMessage(token.actor)) {
          const newMsg = {
            type: GMMessageTypes.RollRequest,
            payload: {
              tokenId: token.id,
              rollRequest: roll
            }
          };

          this.emit(newMsg);
        } else {
          this.manageRoll(token, roll);
        }
      }
    });
  }

  manageAttack(attacker, defender, bonus) {
    this.attackDialog = new CombatAttackDialog(
      attacker,
      defender,
      {
        onAttack: result => {
          this.attackDialog?.close({ force: true });

          this.attackDialog = undefined;

          if (this.combat) {
            this.combat.updateAttackerData(result);
            if (result.values.psychicFatigue) {
              return
            }
            if (canOwnerReceiveMessage(defender.actor)) {
              const newMsg = {
                type: GMMessageTypes.Attack,
                payload: {
                  attackerTokenId: attacker.id,
                  defenderTokenId: defender.id,
                  result
                }
              };

              this.emit(newMsg);
            } else {
              const { critic } = result.values;
              const { visible } = result.values;
              const { projectile } = result.values;
              const { damage } = result.values;
              const { distance } = result.values;
              const { specialPorpuseAttack } = result.values;

              try {
                this.manageDefense(
                  attacker,
                  defender,
                  result.type,
                  critic,
                  visible,
                  projectile,
                  damage,
                  distance,
                  specialPorpuseAttack);
              } catch (err) {
                if (err) {
                  Log.error(err);
                }

                this.endCombat();
              }
            }
          }
        }
      },
      { counterAttackBonus: bonus }
    );
  }

  manageDefense(
    attacker,
    defender,
    attackType,
    critic,
    visible,
    projectile,
    damage,
    distance,
    specialPorpuseAttack) {
    this.defendDialog = new CombatDefenseDialog(
      {
        token: attacker,
        attackType,
        critic,
        visible,
        projectile,
        damage,
        distance,
        specialPorpuseAttack
      },
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
  }
  manageRoll(
    token, roll) {
    this.rollRequestDialog = new RollRequestDialog(
      token,
      roll,
      {
        onRoll: result => {
          if (this.rollRequestDialog) {
            this.rollRequestDialog.close({ force: true });

            this.rollRequestDialog = undefined;

            if (this.combat) {
              this.combat.updateRollData(result);
            }
          }
        }
      }
    );
  }
}
