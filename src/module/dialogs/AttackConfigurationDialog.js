import { Templates } from '../utils/constants';
import { ABFConfig } from '../ABFConfig';
import { ABFAttackData } from '../combat/ABFAttackData';

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

    // Snapshot de targets si no te lo pasan
    const fallbackSnapshot = Array.from(game.user?.targets ?? [])
      .map(t => {
        const token = t?.document ?? t;
        const actorUuid = token?.actor?.id ?? token?.actorId ?? '';
        const tokenUuid = token?.id ?? '';
        const label = token?.name ?? token?.actor?.name ?? '';
        return actorUuid && tokenUuid
          ? { actorUuid, tokenUuid, state: 'pending', label, updatedAt: Date.now() }
          : null;
      })
      .filter(Boolean);

    // 👇 Permite a jugadores (owners) abrir/usar el diálogo sin ser GM
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
        lockedWeapon: !!resolvedWeapon
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
          damage: { special: 0, final: 0 }
        },
        distance: { value: 0, enable: false, check: false }
      },
      targets: Array.isArray(targets) && targets.length ? targets : fallbackSnapshot,

      // 🔓 clave: sin GM. Vale con ser owner; o forzar con options.allowed
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
    return this.modalData?.attacker?.token?.actor;
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
      combat.damage.final =
        (combat.damage.special ?? 0) +
        10 +
        this.attackerActor.system.characteristics.primaries.strength.mod;
    } else {
      combat.weapon = weapon;
      combat.weaponUsed = weapon._id;
      combat.projectile = weapon?.system?.isRanged?.value
        ? { value: true, type: weapon.system.shotType.value }
        : { value: false, type: '' };

      if (!combat.criticSelected) {
        combat.criticSelected = weapon.system.critic.primary.value;
      }

      ui.weaponHasSecondaryCritic =
        weapon?.system?.critic?.secondary?.value !==
        game.animabf.weapon.NoneWeaponCritic.NONE;

      combat.damage.final =
        (combat.damage.special ?? 0) + (weapon?.system?.damage?.final?.value ?? 0);
    }

    this.modalData.config = ABFConfig;
    return this.modalData;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.send-attack').on('click', async ev => {
      ev.preventDefault();
      await this._sendAttack();
    });
  }

  // Comments in English
  async _sendAttack() {
    const actor = this.attackerActor;
    if (!actor) return ui.notifications?.warn('Actor no encontrado.');
    const combat = this.modalData.attacker?.combat;
    const weapon = combat?.weapon;
    if (!weapon) return ui.notifications?.warn('Arma no encontrada.');

    try {
      this.modalData.attackSent = true;
      this.render();

      const baseAttack = Number(weapon.system.attack?.final?.value ?? 0);
      const mod = Number(combat.modifier ?? 0);
      const die =
        actor.system.combat.attack.base.value >= 200
          ? actor.system.general.diceSettings.abilityMasteryDie.value
          : actor.system.general.diceSettings.abilityDie.value;

      const formula = `${die} + ${baseAttack} + ${mod}`;
      const roll = new ABFFoundryRoll(formula, actor.system);
      await roll.evaluate({ async: true });

      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
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
        .isProjectile(!!combat.projectile?.value)
        .automaticCrit(false)
        .critBonus(0)
        .attackerId(actor.id)
        .weaponId(weapon.id)
        // Inject targets captured at dialog open
        .targets(this.modalData.targets ?? [])
        .build();

      await attackData.toChatMessage({ actor, weapon });

      await this.close();
    } catch (err) {
      console.error(err);
      ui.notifications?.error('No se pudo enviar el ataque al chat.');
    } finally {
      this.modalData.attackSent = false;
      if (this.rendered) this.render();
    }
  }

  async _updateObject(event, formData) {
    const wasWeapon = this.modalData.attacker?.combat?.weaponUsed;
    // Prevent weapon changes if locked
    if (this.modalData.ui.lockedWeapon) {
      delete formData['attacker.combat.weaponUsed'];
    }

    this.modalData = foundry.utils.mergeObject(this.modalData, formData);

    if (!this.modalData.ui.lockedWeapon) {
      const curWeapon = this.modalData.attacker?.combat?.weaponUsed;
      if (wasWeapon !== curWeapon) {
        this.modalData.attacker.combat.criticSelected = undefined;
      }
    }

    this.render();
  }
}
