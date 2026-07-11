import { Templates } from '../utils/constants';
import { ABFConfig } from '../ABFConfig';
import { ABFAttackData } from '../combat/ABFAttackData';
import { getSnapshotTargets } from '../actor/utils/getSnapshotTargets.js';
import { getActiveEffectsBreakdownForPath } from '../actor/utils/activeEffectsBreakdown.js';
import { enrichMassAttackCombatUi, getAppliedMassAttackBonus } from '../actor/utils/enrichMassAttackCombatUi.js';
import { isMassOfEnemies } from '../actor/utils/massSettings.js';
import { combineMassAttackDamage } from '../actor/utils/applyMassAttackDamage.js';
///dialogs/AttackConfigurationDialog.js
///actor/utils/getSnapshotTargets.js

export class AttackConfigurationDialog extends FormApplication {
  constructor(object = {}, options = {}) {
    // Expect object: { attacker: TokenDocument, weaponId?: string, weapon?: Item }
    const base = AttackConfigurationDialog._buildInitialData(object);
    super(base, options);
    this.modalData = base;
    this.render(true);
  }

  static _buildInitialData({ attacker, weaponId, weapon, options = {}, targets }) {
    if (!attacker || !attacker.actor) {
      ui.notifications?.error('AttackConfigurationDialog: attacker is required');
      return { allowed: false };
    }

    const attackerActor = attacker.actor;

    const resolvedWeapon =
      weapon ?? (weaponId ? attackerActor.items.get(weaponId) : undefined);

    if (!resolvedWeapon) {
      ui.notifications?.warn('Arma no encontrada.');
    }

    // Fallback targets snapshot (reusing shared helper)
    const fallbackSnapshot = getSnapshotTargets();
    const resolvedTargets =
      Array.isArray(targets) && targets.length ? targets : fallbackSnapshot;

    const isOwner = attackerActor.testUserPermission?.(
      game.user,
      CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
    );

    return {
      ui: {
        isGM: !!game.user?.isGM,
        hasFatiguePoints:
          (attackerActor.system?.characteristics?.secondaries?.fatigue?.value ?? 0) > 0,
        weaponHasSecondaryCritic: undefined,
        lockedWeapon: !!resolvedWeapon,
        isMassOfEnemies: isMassOfEnemies(attackerActor)
      },
      attacker: {
        token: attacker,
        actor: attackerActor,
        combat: {
          fatigueUsed: 0,
          modifier: 0,
          unarmed:
            !resolvedWeapon && (attackerActor.system?.combat?.weapons?.length ?? 0) === 0,
          weaponUsed: resolvedWeapon?._id,
          criticSelected: undefined,
          weapon: resolvedWeapon,
          projectile: { value: false, type: '' },
          damage: { special: 0, final: 0 },
          critDamageBonus: attackerActor.system.general.modifiers.critDamageBonus?.final?.value ?? 0,
          automaticCrit: !!(attackerActor.system.general.modifiers.automaticCrit?.value),
          massAttackBonusEnabled: isMassOfEnemies(attackerActor) ? true : undefined,
          massTargetCount: Math.max(1, resolvedTargets.length || 1),
          massAttackBonusValue: 0
        },
        distance: { value: 0, enable: false, check: false }
      },
      targets: resolvedTargets,
      allowed: options?.allowed ?? isOwner ?? false,
      config: ABFConfig,
      attackSent: false
    };
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['animabf-dialog', 'attack-config-dialog'],
      submitOnChange: true,
      closeOnSubmit: false,
      resizable: true,
      width: null,
      height: null,
      template: Templates.Dialog.Combat.AttackConfigDialog,
      title: game.i18n.localize('macros.combat.dialog.modal.attack.title')
    });
  }

  get attackerActor() {
    // Read the actor through the same resolution that the trace hook
    // uses, so any unlinked-token delta is read consistently and the
    // AE applied to the token (not to the world actor of the sidebar)
    // are visible to the dialog as well.
    const token = this.modalData?.attacker?.token;
    if (!token) return this.modalData?.attacker?.actor ?? null;
    return token.actor ?? token.document?.actor ?? null;
  }

  getData() {
    // Compute weapon, projectile and damage
    const { attacker, ui } = this.modalData;
    if (!attacker?.token) return this.modalData;

    ui.hasFatiguePoints =
      this.attackerActor.system.characteristics.secondaries.fatigue.value > 0;

    const { weapons } = this.attackerActor.system.combat;
    const combat = attacker.combat;

    // If locked, keep the resolved weapon; otherwise resolve from current id
    const weapon = ui.lockedWeapon
      ? combat.weapon
      : weapons.find(w => w._id === combat.weaponUsed);

    combat.unarmed = !weapon;

    if (!weapon) {
      combat.weapon = undefined;
      combat.projectile = { value: false, type: '' };
      combat.damage.final = combineMassAttackDamage(
        this.attackerActor,
        10 + this.attackerActor.system.characteristics.primaries.strength.mod,
        combat.damage.special ?? 0
      );
    } else {
      combat.weapon = weapon;
      combat.weaponUsed = weapon._id;
      // Preserva el valor existente del checkbox; solo resetea si es undefined
      if (!combat.projectile || combat.projectile.value === undefined) {
        combat.projectile = { value: false, type: '' };
      }

      if (!combat.criticSelected) {
        combat.criticSelected = weapon.system.critic.primary.value;
      }

      ui.weaponHasSecondaryCritic =
        weapon?.system?.critic?.secondary?.value !==
        game.animabf.weapon.NoneWeaponCritic.NONE;

      combat.damage.final = combineMassAttackDamage(
        this.attackerActor,
        weapon?.system?.damage?.final?.value ?? 0,
        combat.damage.special ?? 0
      );
    }

    this.modalData.config = ABFConfig;
    enrichMassAttackCombatUi(this.attackerActor, this.modalData);
    return this.modalData;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.send-attack').on('click', async ev => {
      ev.preventDefault();
      await this._sendAttack();
    });
  }

  _captureFormCombatState() {
    const form = this.form;
    const combat = this.modalData?.attacker?.combat;
    if (!form || !combat) return;

    try {
      const { object } = new FormDataExtended(form);
      const formCombat = object?.attacker?.combat;
      if (!formCombat) return;

      if (formCombat.modifier !== undefined) {
        combat.modifier = Number(formCombat.modifier) || 0;
      }
      if (formCombat.fatigueUsed !== undefined) {
        combat.fatigueUsed = Number(formCombat.fatigueUsed) || 0;
      }
    } catch (_) {}
  }

  async _sendAttack() {
    this._captureFormCombatState();

    const actor = this.attackerActor;
    if (!actor) return ui.notifications?.warn('Actor no encontrado.');
    const combat = this.modalData.attacker?.combat;
    const weapon = combat?.weapon;
    if (!weapon) return ui.notifications?.warn('Arma no encontrada.');

    try {
      this.modalData.attackSent = true;
      setTimeout(() => this.render(), 0);

      const baseAttack = Number(weapon.system.attack?.final?.value ?? 0);
      const mod = Number(combat.modifier ?? 0);
      const fatigueUsed = Number(combat.fatigueUsed ?? 0);
      const fatigueMod = fatigueUsed * 15;
      const massBonus = getAppliedMassAttackBonus(this.attackerActor, combat);
      const die =
        actor.system.combat.attack.base.value >= 200
          ? actor.system.general.diceSettings.abilityMasteryDie.value
          : actor.system.general.diceSettings.abilityDie.value;

      // --- Traceability of Active Effects ----------------------------------
      // Active Effects (Sangre de Orochi, Cegueras, Derribado...) write to
      // actor.system.combat.attack.final.value. The weapon's attack.final
      // already inherits that via calculateWeaponAttack, so the AE delta is
      // fused inside baseAttack. To restore traceability we split it back
      // out into its own term in the formula (only when every AE is a
      // linear add — for multiply/override we leave the formula fused and
      // just expose the nominal list in the flavor).
      const aeBreakdown = getActiveEffectsBreakdownForPath(
        actor,
        'system.combat.attack.final.value'
      );
      const aeContribution = aeBreakdown.hasNonLinear ? 0 : aeBreakdown.linearTotal;
      const attackPure = baseAttack - aeContribution;

      const formula = aeContribution !== 0
        ? `${die} + ${attackPure} + ${aeContribution} + ${mod} + ${massBonus} + ${fatigueMod}`
        : `${die} + ${baseAttack} + ${mod} + ${massBonus} + ${fatigueMod}`;

      const roll = new ABFFoundryRoll(formula, actor.system);
      await roll.evaluate({ async: true });

      // 🔹 Use token speaker (alias = token name) instead of actor
      const tokenDocOrToken = this.modalData?.attacker?.token ?? null; // TokenDocument or Token
      const tokenForSpeaker = tokenDocOrToken?.object ?? tokenDocOrToken ?? null; // Token if on canvas
      const tokenName =
        tokenForSpeaker?.name ?? tokenForSpeaker?.document?.name ?? actor.name;
      const speaker = tokenForSpeaker
        ? { ...ChatMessage.getSpeaker({ token: tokenForSpeaker }), alias: tokenName }
        : ChatMessage.getSpeaker({ actor });

      // Flavor base only. The preCreateChatMessage hook in animabf.mjs
      // appends the breakdown of AE that contributed to this roll.
      await roll.toMessage({
        speaker,
        flavor: 'Rolling attack'
      });

      const attackData = ABFAttackData.builder()
        .attackAbility(roll.total)
        .damage(Number(combat.damage?.final ?? weapon.system.damage?.final?.value ?? 0))
        .ignoreArmor(!!weapon.system.ignoreArmor?.value)
        .reducedArmor(Number(weapon.system.reducedArmor?.final?.value ?? 0))
        .armorType(combat.criticSelected ?? weapon.system.critic?.primary?.value)
        .damageType(game.animabf.combat.DamageType.NONE)
        .presence(Number(weapon.system.presence?.final?.value ?? 0))
        .isProjectile(!!combat.projectile?.value || !!weapon.system?.isRanged?.value)
        .projectileType(
          combat.projectile?.type ||
            (weapon.system?.isRanged?.value ? weapon.system?.shotType?.value : '') ||
            ''
        )
        .automaticCrit(!!combat.automaticCrit)
        .critBonus(0)
        .critDamageBonus(Number(combat.critDamageBonus ?? 0))
        .attackerId(actor.id)
        .weaponId(weapon.id)
        .targets(this.modalData.targets ?? [])
        .build();

      await attackData.toChatMessage({ actor, weapon });

      if (fatigueUsed > 0) {
        actor.applyFatigue(fatigueUsed);
      }

      await this.close();
    } catch (err) {
      console.error(err);
      ui.notifications?.error('No se pudo enviar el ataque al chat.');
    } finally {
      this.modalData.attackSent = false;
      if (this.rendered) setTimeout(() => this.render(), 0);
    }
  }

  async _updateObject(event, formData) {
    const wasWeapon = this.modalData.attacker?.combat?.weaponUsed;
    // Prevent weapon changes if locked
    if (this.modalData.ui.lockedWeapon) {
      delete formData['attacker.combat.weaponUsed'];
    }

    // Convierte checkbox a booleano
    if (formData['attacker.combat.projectile.value'] !== undefined) {
      formData['attacker.combat.projectile.value'] =
        formData['attacker.combat.projectile.value'] === 'on' ||
        formData['attacker.combat.projectile.value'] === true;
    }

    if (formData['attacker.combat.massAttackBonusEnabled'] !== undefined) {
      formData['attacker.combat.massAttackBonusEnabled'] =
        formData['attacker.combat.massAttackBonusEnabled'] === 'on' ||
        formData['attacker.combat.massAttackBonusEnabled'] === true;
    }

    this.modalData = foundry.utils.mergeObject(this.modalData, formData);

    if (!this.modalData.ui.lockedWeapon) {
      const curWeapon = this.modalData.attacker?.combat?.weaponUsed;
      if (wasWeapon !== curWeapon) {
        this.modalData.attacker.combat.criticSelected = undefined;
      }
    }

    setTimeout(() => this.render(), 0);
  }
}
