import { Templates } from '../utils/constants';
import { ABFAttackData } from '../combat/ABFAttackData';
import { ABFDefenseData } from '../combat/ABFDefenseData';
import { AbilityData } from '../types/AbilityData';
import { computeCombatResult } from '../combat/computeCombatResult';
import { updateAttackTargetsFlag } from '../../utils/updateAttackTargetsFlag.js';
import { getChatVisibilityOptions } from '../utils/chatVisibility.js';

export class DefenseConfigurationDialog extends FormApplication {
  constructor(object = {}, options = {}) {
    const base = DefenseConfigurationDialog._buildInitialData(object);
    super(base, options);
    this.modalData = base;
    this._claimed = false; // we marked target as "rolling"
    this._resolved = false; // defense was actually sent
    this._initialState = null; // target state when dialog opened
    this.render(true);
  }

  static _buildInitialData({
    defender,
    attacker,
    attackData,
    weaponId,
    options = {},
    messageId
  }) {
    if (!defender || !defender.actor) {
      ui.notifications?.error('DefenseConfigurationDialog: defender is required');
      return { allowed: false };
    }
    const defenderActor = defender.actor;

    const weapons = defenderActor.system?.combat?.weapons ?? [];
    const firstWeapon = weapons[0];

    return {
      ui: {
        isGM: !!game.user?.isGM,
        hasFatiguePoints:
          (defenderActor.system?.characteristics?.secondaries?.fatigue?.value ?? 0) > 0
      },
      attacker: attacker ? { token: attacker, actor: attacker?.actor } : undefined,
      attackData: attackData ? ABFAttackData.fromJSON(attackData) : new ABFAttackData(),
      defender: {
        token: defender,
        actor: defenderActor,
        withoutRoll: false,
        showRoll: !game.user?.isGM,
        combat: {
          modifier: 0,
          fatigueUsed: 0,
          multipleDefensesPenalty: 0,
          weaponUsed: firstWeapon?._id,
          weapon: firstWeapon,
          unarmed: weapons.length === 0
        }
      },
      defenseSent: false,
      allowed: game.user?.isGM || (options?.allowed ?? true),
      messageId: messageId ?? options?.messageId ?? '' // <- keep chat message id here
    };
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['animabf-dialog', 'defense-config-dialog'],
      submitOnChange: true,
      closeOnSubmit: false,
      width: 520,
      height: 'auto',
      resizable: true,
      template: Templates.Dialog.Combat.DefenseConfigDialog,
      title: game.i18n.localize('macros.combat.dialog.defending.defend.title')
    });
  }

  get defenderActor() {
    return this.modalData?.defender?.actor;
  }

  getData() {
    const { defender, ui } = this.modalData;
    if (!defender?.actor) return this.modalData;

    ui.hasFatiguePoints =
      (this.defenderActor.system?.characteristics?.secondaries?.fatigue?.value ?? 0) > 0;

    const weapons = this.defenderActor.system?.combat?.weapons ?? [];
    defender.combat.weapon =
      weapons.find(w => w._id === defender.combat.weaponUsed) ?? undefined;
    defender.combat.unarmed = weapons.length === 0;

    return this.modalData;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.send-defense').on('click', async ev => {
      ev.preventDefault();
      const type = ev.currentTarget.dataset.type === 'block' ? 'block' : 'dodge';
      await this._sendDefenseToChat(type);
    });
  }

  async _sendDefenseToChat(type) {
    const actor = this.defenderActor;
    if (!actor) return ui.notifications?.warn('Defender no encontrado.');

    const { defender, attackData } = this.modalData;
    const combat = defender?.combat ?? {};
    const weapon = combat.weapon;

    try {
      this.modalData.defenseSent = true;
      this.render();

      const vis = getChatVisibilityOptions();

      // Build defense ability
      const defenseAbility = AbilityData.builder()
        .naturalBase(
          type === 'block'
            ? defender?.combat.unarmed
              ? actor.system?.combat?.block?.base?.value ?? 0
              : weapon?.system?.block?.base?.value ?? 0
            : actor.system?.combat?.dodge?.base?.value ?? 0
        )
        .finalBase(
          type === 'block'
            ? defender?.combat.unarmed
              ? actor.system?.combat?.block?.final?.value ?? 0
              : weapon?.system?.block?.final?.value ?? 0
            : actor.system?.combat?.dodge?.final?.value ?? 0
        )
        .build();

      const die =
        defenseAbility.naturalBase >= 200
          ? actor.system?.general?.diceSettings?.abilityMasteryDie?.value ?? '1d100'
          : actor.system?.general?.diceSettings?.abilityDie?.value ?? '1d100';

      const mod = Number(combat?.modifier ?? 0);
      const multiPenalty = Number(combat?.multipleDefensesPenalty ?? 0);
      const staticBonus = (defenseAbility.finalBase ?? 0) + mod + multiPenalty;

      const formula = `${die} + ${staticBonus}`;
      const roll = new ABFFoundryRoll(formula, actor.system);
      await roll.evaluate({ async: true });

      // 🔹 Use token for speaker (alias = token name)
      const tokenDocOrToken = defender?.token ?? null; // TokenDocument or Token
      const tokenForSpeaker = tokenDocOrToken?.object ?? tokenDocOrToken ?? null;
      const tokenName =
        tokenForSpeaker?.name ?? tokenForSpeaker?.document?.name ?? actor.name;
      const speaker = tokenForSpeaker
        ? { ...ChatMessage.getSpeaker({ token: tokenForSpeaker }), alias: tokenName }
        : ChatMessage.getSpeaker({ actor });

      await roll.toMessage({
        speaker,
        flavor: 'Rolling defense',
        rollMode: vis.rollMode
      });

      const armorType = attackData?.armorType;
      const taFinal =
        armorType != null
          ? actor.system?.combat?.totalArmor?.at?.[armorType]?.value ?? 0
          : 0;

      const defenseData = ABFDefenseData.builder()
        .defenseAbility(roll.total)
        .armor(taFinal)
        .inmodifiableArmor(false)
        .defenseType(type)
        .defenderId(actor.id)
        .defenderTokenId(defender?.token?.id ?? '')
        .weaponId(weapon?._id ?? '')
        .build();

      const combatResult = computeCombatResult(attackData, defenseData);

      const damageFinal = Number(
        combatResult?.damageFinal ??
          combatResult?.damage?.final ??
          combatResult?.finalDamage ??
          combatResult?.damage ??
          0
      );

      const content = await renderTemplate(Templates.Chat.CombatResult, {
        combatResult: { ...combatResult, damageFinal },
        defenderId: actor.id,
        defenderTokenId: defender?.token?.id ?? ''
      });

      await ChatMessage.create({
        content,
        speaker, // 🔹 usa el mismo speaker basado en token
        ...vis,
        flags: {
          animabf: {
            kind: 'combatResult',
            result: { ...combatResult, damageFinal },
            defender: {
              actorId: actor.id,
              tokenId: defender?.token?.id ?? ''
            },
            damageControl: { appliedOnce: false, apps: [] }
          }
        }
      });

      // Mark as resolved + done in the original attack (store tokenUuid as UUID when possible)
      this._resolved = true;
      await updateAttackTargetsFlag(this.modalData.messageId, {
        actorUuid: actor.id,
        tokenUuid:
          tokenDocOrToken?.document?.uuid ??
          tokenDocOrToken?.uuid ??
          defender?.token?.id ??
          '',
        state: 'done',
        rolledBy: game.user.id,
        defenseResult: defenseData.toJSON?.() ?? defenseData,
        updatedAt: Date.now()
      });

      await this.close();
    } catch (err) {
      console.error(err);
      ui.notifications?.error('No se pudo enviar la defensa al chat.');
    } finally {
      this.modalData.defenseSent = false;
      if (this.rendered) this.render();
    }
  }

  async _updateObject(event, formData) {
    const prevWeapon = this.modalData?.defender?.combat?.weaponUsed;
    this.modalData = foundry.utils.mergeObject(this.modalData, formData);

    if (prevWeapon !== this.modalData?.defender?.combat?.weaponUsed) {
      // Weapon changed; next getData() will refresh defender.combat.weapon
    }

    this.render();
  }

  async render(force, options) {
    const firstRealRender = !this.rendered;

    if (firstRealRender && this.modalData?.messageId && this.defenderActor) {
      try {
        const msg = game.messages.get(this.modalData.messageId);
        const targets = msg?.getFlag(game.animabf.id, 'targets') ?? [];
        const keyA = this.defenderActor.id;
        const keyT = this.modalData?.defender?.token?.id ?? '';

        // ✅ token-first
        const entry =
          targets.find(t => keyT && t.tokenUuid === keyT) ||
          targets.find(t => !keyT && !t.tokenUuid && t.actorUuid === keyA);

        // Track initial precisely: null => "no existía"
        this._initialState = entry?.state ?? null;
        this._claimed = false;
        this._resolved = this._resolved ?? false;

        // Only claim if existía y estaba 'pending'
        if (this._initialState === 'pending') {
          await updateAttackTargetsFlag(this.modalData.messageId, {
            actorUuid: keyA,
            tokenUuid: keyT,
            state: 'rolling',
            rolledBy: game.user.id,
            claimedAt: Date.now(),
            updatedAt: Date.now()
          });
          this._claimed = true;
        }
      } catch (e) {
        console.warn('[ABF] claim rolling failed:', e);
      }
    }

    return super.render(force, options);
  }

  async close(options) {
    try {
      if (
        this._claimed &&
        !this._resolved &&
        this.modalData?.messageId &&
        this.defenderActor
      ) {
        const msg = game.messages.get(this.modalData.messageId);
        const targets = msg?.getFlag(game.animabf.id, 'targets') ?? [];
        const keyA = this.defenderActor.id;
        const keyT = this.modalData?.defender?.token?.id ?? '';

        // ✅ token-first
        const current =
          targets.find(t => keyT && t.tokenUuid === keyT)?.state ??
          targets.find(t => !keyT && !t.tokenUuid && t.actorUuid === keyA)?.state;

        // Si alguien lo terminó mientras tanto, no lo toques
        if (current !== 'done') {
          await updateAttackTargetsFlag(this.modalData.messageId, {
            actorUuid: keyA,
            tokenUuid: keyT,
            state: this._initialState, // 'pending' (o null -> no existía)
            updatedAt: Date.now()
          });
        }
      }
    } catch (e) {
      console.warn('[ABF] rollback failed:', e);
    }
    return super.close(options);
  }
}
