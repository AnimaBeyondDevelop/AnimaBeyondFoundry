import { openModDialog } from '../utils/dialogs/openSimpleInputDialog';
import { SvelteApplication } from '@svelte/SvelteApplication.svelte';
import ResultsDialog from './ResultsDialog.svelte';
import { Attack, AttackDialog } from './attack';
import { Defense, DefenseDialog } from './defense';
import { Logger } from '@utils/log';

/**
 * @import { DocumentConstructionContext } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/types.mjs';
 * @import { CombatDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/types/documentConfiguration.mjs';
 */

export default class ABFCombat extends Combat {
  /** @type {SvelteApplication<typeof ResultsDialog>?} */
  gmResultsDialog;
  /** @type {SvelteApplication<typeof AttackDialog>?} */
  attackDialog;
  /** @type {SvelteApplication<typeof DefenseDialog>?} */
  defenseDialog;
  /**
   *  @param {CombatDataConstructorData} data
   *  @param {DocumentConstructionContext} [context]
   */
  constructor(data, context) {
    super(data, context);
    this.setFlag('world', 'newRound', true);
  }

  async startCombat() {
    const combatants = this.combatants.map(c => c.token);
    for (let token of combatants) {
      token?.actor?.resetDefensesCounter();
    }
    return super.startCombat();
  }

  async nextTurn() {
    if (this.getFlag('world', 'newRound')) {
      this.setFlag('world', 'newRound', false);
    }
    return super.nextTurn();
  }

  async nextRound() {
    // Reset initiative for everyone when going to the next round
    await this.resetAll();
    this.setFlag('world', 'newRound', true);

    const combatants = this.combatants.map(c => c.token);
    for (let token of combatants) {
      token?.actor?.resetDefensesCounter();
      token?.actor?.consumeMaintainedZeon();
      token?.actor?.psychicShieldsMaintenance();
    }

    return super.nextRound();
  }

  async previousRound() {
    // Reset initiative for everyone when going to the next round
    await this.resetAll();

    const combatants = this.combatants.map(c => c.token);
    for (let token of combatants) {
      token?.actor?.consumeMaintainedZeon(true);
      token?.actor?.psychicShieldsMaintenance(true);
    }

    return super.previousRound();
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    this.combatants.forEach(combatant => {
      combatant.actor?.prepareDerivedData();
    });
  }

  /**
   * Modify rollInitiative so that it asks for modifiers
   * @param {string[] | string} ids
   * @param {{updateTurn?: boolean, messageOptions?: any}} [options]
   */
  async rollInitiative(ids, { updateTurn = false, messageOptions } = {}) {
    const mod = await openModDialog();

    if (typeof ids === 'string') {
      ids = [ids];
    }
    for (const id of ids) {
      const combatant = this.combatants.get(id);

      await super.rollInitiative(id, {
        formula: `1d100Initiative + ${combatant?.actor?.system.characteristics.secondaries.initiative.final.value} + ${mod}`,
        updateTurn,
        messageOptions
      });
    }

    if (this.getFlag('world', 'newRound')) {
      await this.update({ turn: 0 }); // Updates active turn such that it is the one with higher innitiative.
    }

    return this;
  }

  /**
   * @protected @override
   * @param {Combatant} combatantA
   * @param {Combatant} combatantB
   */
  _sortCombatants(combatantA, combatantB) {
    let initiativeA = combatantA.initiative || -9999;
    let initiativeB = combatantB.initiative || -9999;
    if (
      initiativeA <
      (combatantA?.actor?.system.characteristics.secondaries.initiative.final.value || 0)
    )
      initiativeA -= 2000;
    if (
      initiativeB <
      (combatantB?.actor?.system.characteristics.secondaries.initiative.final.value || 0)
    )
      initiativeB -= 2000;
    return initiativeB - initiativeA;
  }

  /**
   * @param {TokenDocument} attackerToken
   * @param {TokenDocument} defenderToken
   * @param {number} [counterAttackBonus]
   */
  newCombatDialog(attackerToken, defenderToken, counterAttackBonus) {
    if (!game.ready) return;
    if (!game.animabf.socket) return;
    if (!game.user?.isGM) return;

    if (this.gmResultsDialog) {
      throw new Error('macros.combat.dialog.error.alreadyInCombat.title');
    }

    let attackPromise = game.animabf.socket
      .requestAttack(attackerToken, defenderToken, counterAttackBonus)
      .then(payload => Attack.fromJSON(payload.attack));
    let defensePromise = attackPromise.then(attack => {
      if (!attack) {
        Logger.error('No attack was returned from the server');
        return;
      }

      return game.animabf.socket
        .requestDefense(attack)
        .then(payload => Defense.fromJSON(payload.defense));
    });

    this.gmResultsDialog = new SvelteApplication(
      ResultsDialog,
      {
        attack: attackPromise,
        defense: defensePromise,
        onClose: () => this.cancelCombatDialogs(),
        onCounterAttack: (/** @type {number} */ bonus) => {
          this.cancelCombatDialogs();

          this.newCombatDialog(defenderToken, attackerToken, bonus);
        }
      },
      { frameless: true }
    );
    this.gmResultsDialog.render(true);
  }

  /**
   * @param {TokenDocument} attackerToken
   * @param {TokenDocument} defenderToken
   * @param {number} [counterAttackBonus]
   *
   * @returns {Promise<Attack>}
   */
  newAttack(attackerToken, defenderToken, counterAttackBonus) {
    return new Promise(resolve => {
      this.attackDialog = new SvelteApplication(
        AttackDialog,
        {
          attacker: attackerToken,
          defender: defenderToken,
          onAttack: (/** @type {Attack} */ attack) => {
            resolve(attack);
            this.closeAttackDialog();
          },
          counterAttackBonus
        },
        { frameless: true }
      );
      this.attackDialog.render(true);
    });
  }

  /**
   * @param {Attack} attack
   *
   * @returns {Promise<Defense>}
   */
  newDefense(attack) {
    return new Promise(resolve => {
      this.defenseDialog = new SvelteApplication(
        DefenseDialog,
        {
          attack,
          onDefend: (/** @type {Defense} */ defense) => {
            resolve(defense);
            this.closeDefenseDialog();
          }
        },
        { frameless: true }
      );
      this.defenseDialog.render(true);
    });
  }

  closeAttackDialog() {
    if (!this.attackDialog) return;

    // TODO: check if this works without the options in close
    this.attackDialog.close({ force: true });
    this.attackDialog = null;
  }

  closeDefenseDialog() {
    if (!this.defenseDialog) return;
    // TODO: check if this works without the options in close
    this.defenseDialog.close({ force: true });
    this.defenseDialog = null;
  }

  closeResultsDialog() {
    if (!this.gmResultsDialog) return;

    // TODO: check if this works without the options in close
    this.gmResultsDialog?.close({ executeHook: false, force: true });
    this.gmResultsDialog = null;
  }

  cancelCombatDialogs() {
    game.animabf?.socket.cancelCombat();
    this.closeResultsDialog();
    this.closeAttackDialog();
    this.closeDefenseDialog();
  }
}
