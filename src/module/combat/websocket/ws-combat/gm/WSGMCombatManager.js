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
      console.log(this.combat)
      const { attackerToken, defendersToken, defendersActor } = this.combat;

      const { critic } = msg.payload.values;
      const { visible } = msg.payload.values;
      const { projectile } = msg.payload.values;
      const { damage } = msg.payload.values;
      const { distance } = msg.payload.values;
      const { specialPorpuseAttack } = msg.payload.values;
      const { areaAttack } = msg.payload.values;

      for (let i = 0; i < defendersToken.length; i++) {

        if (canOwnerReceiveMessage(defendersActor[i])) {
          const newMsg = {
            type: GMMessageTypes.Attack,
            payload: {
              attackerTokenId: attackerToken.id,
              defenderTokenId: defendersToken[i].id,
              result: msg.payload
            }
          };

          this.emit(newMsg);
        } else {
          try {
            this.manageDefense(
              attackerToken,
              defendersToken[i],
              msg.payload.type,
              critic,
              visible,
              projectile,
              damage,
              distance,
              specialPorpuseAttack,
              areaAttack);
          } catch (err) {
            if (err) {
              Log.error(err);
            }

            this.endCombat();
          }
        }
      }
    } else {
      Log.warn('User attack received but none combat is running');
    }
  }

  manageUserDefense(msg) {
    if (this.combat) {
      this.combat.updateDefenderData(msg.payload, msg.defenderTokenId);
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

    if (this.defenseDialog) {
      for (const defenderId in this.defenseDialog) {
        this.defenseDialog[defenderId]?.close({ force: true });

        this.defenseDialog[defenderId] = undefined;
      }
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

    const targetTokens = getTargetToken(selectedToken, targets);

    if (selectedToken?.id) {
      await ABFDialogs.confirm(
        this.game.i18n.format('macros.combat.dialog.attackConfirm.title'),
        this.game.i18n.format('macros.combat.dialog.attackConfirm.body.title', {
          target: targetTokens.map(t => t.name).join(" - ")
        }),
        {
          onConfirm: () => {
            if (selectedToken?.id && targetTokens?.every(t => { return t?.id })) {
              this.combat = this.createNewCombat(selectedToken, targetTokens);

              this.manageAttack(selectedToken, targetTokens);
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

    const { attackerTokenId, defendersTokenId } = msg.payload;

    const attacker = this.findTokenById(attackerTokenId);
    const defenders = defendersTokenId.map(id => { return this.findTokenById(id) });

    if (!attacker || !defenders) {
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
          defender: defenders[0].actor
        });
      }

      this.combat = this.createNewCombat(attacker, defenders);

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

  createNewCombat(attacker, defenders) {
    return new GMCombatDialog(attacker, defenders, {
      onClose: () => {
        this.endCombat();
      },
      onCounterAttack: (bonus, index) => {
        this.endCombat();

        this.combat = new GMCombatDialog(
          defenders[index],
          [attacker],
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

        if (canOwnerReceiveMessage(defenders[index].actor)) {
          const newMsg = {
            type: GMMessageTypes.CounterAttack,
            payload: {
              attackerTokenId: defenders[index].id,
              defenderTokenId: attacker.id,
              counterAttackBonus: bonus
            }
          };

          this.emit(newMsg);
        } else {
          this.manageAttack(defenders[index], [attacker], bonus);
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

  manageAttack(attacker, defenders, bonus) {
    this.attackDialog = new CombatAttackDialog(
      attacker,
      defenders,
      {
        onAttack: result => {
          defenders.forEach(defender => {
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
                const { areaAttack } = result.values;

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
                    specialPorpuseAttack,
                    areaAttack);
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

  manageDefense(
    attacker,
    defender,
    attackType,
    critic,
    visible,
    projectile,
    damage,
    distance,
    specialPorpuseAttack,
    areaAttack) {
    if (!this.defenseDialog) {
      this.defenseDialog = { [defender._id]: undefined }
    }
    this.defenseDialog[defender._id] = new CombatDefenseDialog(
      {
        token: attacker,
        attackType,
        critic,
        visible,
        projectile,
        damage,
        distance,
        specialPorpuseAttack,
        areaAttack
      },
      defender,
      {
        onDefense: result => {
          if (this.defenseDialog[defender._id]) {
            this.defenseDialog[defender._id].close({ force: true });

            this.defenseDialog[defender._id] = undefined;

            if (this.combat) {
              this.combat.updateDefenderData(result, defender._id);
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
