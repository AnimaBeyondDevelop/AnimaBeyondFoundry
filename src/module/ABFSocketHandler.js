/**
 * @typedef {typeof ABFMessageTypes[keyof ABFMessageTypes]} MessageTypes
 * @typedef {Object} ABFMessage Message sent through the game socket.
 * @property {MessageTypes} type
 * @property {Object} [payload]
 * @property {string} senderId User id of the message sender.
 * @property {string} [recipientId] User id of the message recipient.
 * @property {string} [messageId] Id identifying the message. When present, response is awaited.
 * @property {boolean} [awaitsResponse]
 */

import { Logger } from '@utils/log';
import { CombatDialogs } from '@module/combat/websocket/dialogs/CombatDialogs';
import { ABFSettingsKeys } from '@utils/registerSettings';
import { SvelteApplication } from '@svelte/SvelteApplication.svelte';
import ResultsDialog from '@module/combat/ResultsDialog.svelte';
import { Attack } from './combat/attack';
import { Defense } from './combat/defense';

const ABFMessageTypes = /** @type {const} */ ({
  AttackPermissionRequest: 'attack-permission-request',
  AttackRequest: 'attack-request',
  DefenseRequest: 'attack-request',
  Attack: 'attack',
  Defend: 'defend',
  CancelCombat: 'cancel-combat',
  CounterAttackRequest: 'counter-attack',
  ResponseResolve: 'response-resolve',
  ResponseReject: 'response-reject',
  Error: 'error'
});

/**
 * Socket Handler for ABF system.
 * Inspiration from https://gitlab.com/peginc/swade/-/blob/develop/src/module/SwadeSocketHandler.ts
 * @class
 */
export class ABFSocketHandler {
  #identifier = 'system.animabf';

  #pendingMessages = new Map();

  constructor() {
    if (game.animabf?.socket) throw new Error('ABFSocketHandler already exists');

    // Register socket listeners
    game.socket?.on(this.#identifier, msg => this.receive(msg));
  }

  /**
   * Sends any serializable args through the game socket, using the "system.animabf" event.
   * @param {Omit<ABFMessage,"senderId">} msg
   */
  async emit({ type, payload, awaitsResponse, recipientId, messageId }) {
    // Ensure user is logged in and game is ready
    if (!game.users) return;
    if (!game.userId) return;
    // If message is for GM but no GM is present, do nothing
    if (recipientId === 'GM') {
      const gm = game.users.activeGM?.id;
      if (!gm) throw new Error('errors.socket.unavailableGM');
      recipientId = gm;
    }
    if (game.users.find(u => u.id === recipientId)) {
      throw new Error('errors.socket.unavailableRecipient');
    }

    /** @type {ABFMessage} */
    let msg = {
      type,
      payload,
      senderId: game.userId,
      recipientId
    };

    if (messageId) msg.messageId = messageId;

    if (awaitsResponse) {
      const messageId = `${game.userId}-${Date.now()}`;
      msg.messageId = messageId;
      return new Promise((resolve, reject) => {
        this.#pendingMessages.set(messageId, { resolve, reject });
      });
    }
    game.socket?.emit('system.animabf', msg);
  }

  /**
   * Receives a message from the game socket, and processes it.
   * @param {ABFMessage} msg
   */
  receive(msg) {
    // If there is a recipient different from the current user, ignore the message.
    if (msg.recipientId && msg.recipientId !== game.userId) return;

    try {
      switch (msg.type) {
        case ABFMessageTypes.AttackPermissionRequest:
          this.#onAttackPermissionRequest(msg);
          break;
        case ABFMessageTypes.AttackRequest:
          this.#onAttackRequest(msg);
          break;
        case ABFMessageTypes.DefenseRequest:
          this.#onDefenseRequest(msg);
          break;
        // TODO: remove after testing
        case ABFMessageTypes.Attack:
          throw new Error('#onAttack not implemented');
        // TODO: remove after testing
        case ABFMessageTypes.Defend:
          throw new Error('#onDefend not implemented');
        case ABFMessageTypes.CancelCombat:
          this.#onCancelCombat(msg);
          break;
        // TODO: remove after testing
        case ABFMessageTypes.CounterAttackRequest:
          throw new Error('#onCounterAttack not implemented');
        case ABFMessageTypes.ResponseResolve:
          this.#onResponse(msg, 'resolve');
          break;
        case ABFMessageTypes.ResponseReject:
          this.#onResponse(msg, 'reject');
          break;
        case ABFMessageTypes.Error:
          if (msg.messageId) this.#onResponse(msg, 'reject');
          // TODO: improve types for message payload
          Logger.error(msg.payload.error);
          break;
        default:
          throw new Error(`ABFSocketError | Unknown message type: ${msg.type}`);
      }
    } catch (err) {
      Logger.error(err);

      const newMsg = {
        type: ABFMessageTypes.Error,
        recipientId: msg.senderId,
        messageId: msg.messageId,
        payload: {
          error: err
        }
      };

      this.emit(newMsg);
      return;
    }
  }

  /**
   * @param {ABFMessage} msg
   * @param {"resolve" | "reject"} action
   */
  #onResponse(msg, action) {
    const pending = this.#pendingMessages.get(msg.messageId);
    if (pending) {
      pending[action](msg.payload);
      this.#pendingMessages.delete(msg.messageId);
    }
  }

  /** @param {ABFMessage} msg */
  async #onAttackPermissionRequest(msg) {
    if (!game.combat) return;
    if (!game.users?.activeGM) throw new Error('No GM present');

    // TODO: Add types to messages payload
    const { attackerTokenId, defenderTokenId } = msg.payload;

    const attacker = this.findTokenById(attackerTokenId);
    const defender = this.findTokenById(defenderTokenId);

    if (!attacker || !defender) {
      throw new Error(
        'Attack request cannot be handled due to non existing attacker or defender actor'
      );
    }

    try {
      if (!game.settings.get('animabf', ABFSettingsKeys.AUTO_ACCEPT_COMBAT_REQUESTS)) {
        await CombatDialogs.openCombatRequestDialog({
          attacker: attacker.actor,
          defender: defender.actor
        });
      }
    } catch {
      throw new Error('macros.combat.dialog.error.requestRejected.title');
    }

    const newMsg = {
      type: ABFMessageTypes.ResponseResolve,
      recipientId: msg.senderId,
      messageId: msg.messageId,
      payload: { allowed: true }
    };

    this.emit(newMsg);
    game.combat.newCombatDialog(attacker, defender);
  }

  /** @param {ABFMessage} msg */
  #onAttackRequest(msg) {
    if (!game.combat) throw new Error('No combat present.');
    const { attackerTokenId, defenderTokenId, counterAttackBonus } = msg.payload;

    game.combat
      .newAttack(attackerTokenId, defenderTokenId, counterAttackBonus)
      .then((/** @type {Attack} */ attack) =>
        this.emit({
          type: ABFMessageTypes.ResponseResolve,
          recipientId: msg.senderId,
          messageId: msg.messageId,
          payload: { attack }
        })
      );
  }

  /** @param {ABFMessage} msg */
  #onDefenseRequest(msg) {
    if (!game.combat) throw new Error('No combat present.');
    const attack = Attack.fromJSON(msg.payload.attack);

    game.combat.newDefense(attack).then((/** @type {Defense} */ defense) =>
      this.emit({
        type: ABFMessageTypes.ResponseResolve,
        recipientId: msg.senderId,
        messageId: msg.messageId,
        payload: { defense }
      })
    );
  }

  #onCancelCombat() {
    if (!game.combat) return;
    game.combat.cancelCombatDialogs();
  }

  cancelCombat() {
    this.emit({ type: ABFMessageTypes.CancelCombat });
  }

  /**
   * @param {TokenDocument} attackerToken
   * @param {TokenDocument} defenderToken
   */
  requestAttackPermission(attackerToken, defenderToken) {
    return this.emit({
      type: ABFMessageTypes.AttackPermissionRequest,
      recipientId: 'GM',
      payload: {
        attackerTokenId: attackerToken.id,
        defenderTokenId: defenderToken.id
      },
      awaitsResponse: true
    });
  }

  /**
   * @param {TokenDocument} attackerToken
   * @param {TokenDocument} defenderToken
   * @param {number} [counterAttackBonus]
   *
   * @returns {Promise<Attack>}
   */
  requestAttack(attackerToken, defenderToken, counterAttackBonus) {
    const recipientId = this.controllerOrFirstOwner(attackerToken.id);
    if (recipientId === game.user?.id)
      return game.combat?.newAttack(attackerToken, defenderToken, counterAttackBonus);

    return this.emit({
      type: ABFMessageTypes.AttackRequest,
      recipientId,
      payload: {
        attackerTokenId: attackerToken.id,
        defenderTokenId: defenderToken.id,
        counterAttackBonus
      },
      awaitsResponse: true
    });
  }

  /**
   * @param {Attack} attack
   *
   * @returns {Promise<Defense>}
   */
  requestDefense(attack) {
    const recipientId = this.controllerOrFirstOwner(attack.defenderToken.id);
    if (recipientId === game.user?.id) return game.combat?.newDefense(attack);

    return this.emit({
      type: ABFMessageTypes.DefenseRequest,
      recipientId,
      payload: {
        attack
      },
      awaitsResponse: true
    });
  }

  // TODO: Write this function
  controllerOrFirstOwner(tokenId) {
    throw new Error('controllerOrFirstOwner not implemented');
  }

  // TODO: move this to a better place (maybe the macro).
  findTokenById(tokenId) {
    const token = this.game.scenes
      ?.find(scene => !!scene.tokens.find(u => u?.id === tokenId))
      ?.tokens.find(u => u?.id === tokenId);

    if (!token) {
      const message = this.game.i18n.format(
        'macros.combat.dialog.error.noExistTokenAnymore.title',
        {
          token: tokenId
        }
      );

      ABFDialogs.prompt(message);
      throw new Error(message);
    }

    if (!token.actor) {
      const message = this.game.i18n.format(
        'macros.combat.dialog.error.noActorAssociatedToToken.title',
        {
          token: tokenId
        }
      );

      ABFDialogs.prompt(message);
      throw new Error(message);
    }

    return token;
  }
}
