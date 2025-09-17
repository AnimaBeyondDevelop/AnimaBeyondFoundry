import { Templates } from '../utils/constants';
import { getChatVisibilityOptions } from '../utils/chatVisibility.js';

export class ABFAttackData {
  /** @param {Partial<ABFAttackData>} p */
  constructor(p = {}) {
    // Core roll / values
    this.attackAbility = p.attackAbility ?? 0;
    this.damage = p.damage ?? 0;
    this.reducedArmor = p.reducedArmor ?? 0;
    this.ignoreArmor = !!p.ignoreArmor;
    this.armorType = p.armorType ?? game.abf.weapon.NoneWeaponCritic.NONE;

    // Damage typing
    this.damageType = p.damageType ?? game.abf.combat.DamageType.NONE;
    this.damagesEnergy = !!p.damagesEnergy;

    // Targeting / delivery
    this.aimed = !!p.aimed;
    this.aimedWhere = p.aimedWhere ?? '';
    this.isProjectile = !!p.isProjectile;
    this.projectileType = p.projectileType ?? '';
    this.isArea = !!p.isArea;
    this.areaDesc = p.areaDesc ?? '';

    // Crit / opposed / misc combat bonuses
    this.automaticCrit = !!p.automaticCrit;
    this.critBonus = p.critBonus ?? 0;
    this.opposedCheckBonus = p.opposedCheckBonus ?? 0;
    this.maneuvers = Array.isArray(p.maneuvers) ? [...p.maneuvers] : [];

    // Extra flags
    this.breakage = p.breakage ?? 0;
    this.visibilityConditions = Array.isArray(p.visibilityConditions)
      ? [...p.visibilityConditions]
      : [];
    this.concealedAmount = p.concealedAmount ?? 0;
    this.intangible = !!p.intangible;
    this.presence = p.presence ?? 0;
    this.canBeCounterAttacked = p.canBeCounterAttacked !== false;

    // Effects on hit
    this.onHitEffects = Array.isArray(p.onHitEffects) ? [...p.onHitEffects] : [];

    // Attacker refs (ids, never whole objects)
    this.attackerId = p.attackerId ?? '';
    this.weaponId = p.weaponId ?? '';

    // Defense tracking targets
    // Each target: {actorUuid, tokenUuid?, state, rolledBy?, defenseResult?, updatedAt?, label?, auto?}
    this.targets = Array.isArray(p.targets)
      ? p.targets.map(ABFAttackData._normalizeTarget)
      : [];
  }

  // Comments in English
  static _normalizeTarget(t = {}) {
    return {
      actorUuid: String(t.actorUuid ?? t.actorId ?? ''),
      tokenUuid: String(t.tokenUuid ?? t.tokenId ?? ''),
      state: t.state ?? 'pending', // 'pending'|'rolling'|'done'|'expired'
      rolledBy: t.rolledBy ?? '',
      defenseResult: t.defenseResult ?? null,
      label: t.label ?? t.actorName ?? undefined,
      updatedAt: Number(isFinite(t.updatedAt) ? t.updatedAt : Date.now()),
      auto: !!t.auto
    };
  }

  toJSON() {
    return {
      ...this,
      targets: (this.targets ?? []).map(t => ({ ...t }))
    };
  }

  static fromJSON(jsonStringOrObj) {
    const obj =
      typeof jsonStringOrObj === 'string' ? JSON.parse(jsonStringOrObj) : jsonStringOrObj;
    return new ABFAttackData(obj);
  }

  /**
   * Render and post the attack chat message using Templates.Chat.AttackData.
   * It does NOT post the separate dice roll message; do that before if needed.
   * @param {{actor?: Actor, weapon?: Item}} [opts]
   * @returns {Promise<ChatMessage|undefined>}
   */
  async toChatMessage(opts = {}) {
    const actor =
      opts.actor ?? (this.attackerId ? game.actors?.get?.(this.attackerId) : null);
    if (!actor) {
      ui.notifications?.warn('Actor no encontrado para el mensaje de ataque.');
      return;
    }

    const weapon =
      opts.weapon ?? (this.weaponId ? actor.items?.get?.(this.weaponId) : null);
    if (!weapon) {
      ui.notifications?.warn('Arma no encontrada para el mensaje de ataque.');
      return;
    }

    const vis = getChatVisibilityOptions();

    const content0 = await renderTemplate(Templates.Chat.AttackData, {
      weapon,
      actor,
      attackData: this
    });
    const initialTargets = (this.targets ?? []).map(ABFAttackData._normalizeTarget);

    const msg = await ChatMessage.create({
      user: game.user.id,
      content: content0,
      speaker: ChatMessage.getSpeaker({ actor }),
      ...vis,
      flags: {
        abf: {
          kind: 'attackData',
          attackData: this.toJSON(),
          sessionId: randomID(),
          sessionMeta: {
            createdAt: Date.now(),
            combatId: game.combat?.id ?? null,
            round: game.combat?.round ?? 0,
            turn: game.combat?.turn ?? 0
          },
          targets: initialTargets
        }
      }
    });

    const content = await renderTemplate(Templates.Chat.AttackData, {
      weapon,
      actor,
      attackData: this,
      messageId: msg.id
    });
    await msg.update({ content, ...vis }); // keep visibility on update too

    return msg;
  }

  static builder() {
    return new ABFAttackDataBuilder();
  }
}

export class ABFAttackDataBuilder {
  constructor() {
    this._p = {};
  }

  // Core roll / values
  attackAbility(v) {
    this._p.attackAbility = Number(v) || 0;
    return this;
  }
  damage(v) {
    this._p.damage = Number(v) || 0;
    return this;
  }
  reducedArmor(v) {
    this._p.reducedArmor = Number(v) || 0;
    return this;
  }
  ignoreArmor(b = true) {
    this._p.ignoreArmor = !!b;
    return this;
  }
  armorType(t) {
    this._p.armorType = t ?? game.abf.weapon.NoneWeaponCritic.NONE;
    return this;
  }

  // Damage typing
  damageType(t) {
    this._p.damageType = t ?? game.abf.combat.DamageType.NONE;
    return this;
  }
  damagesEnergy(b = true) {
    this._p.damagesEnergy = !!b;
    return this;
  }

  // Targeting / delivery
  aimed(b = true) {
    this._p.aimed = !!b;
    return this;
  }
  aimedWhere(s) {
    this._p.aimedWhere = String(s ?? '');
    return this;
  }
  isProjectile(b = true) {
    this._p.isProjectile = !!b;
    return this;
  }
  projectileType(s) {
    this._p.projectileType = String(s ?? '');
    return this;
  }
  isArea(b = true) {
    this._p.isArea = !!b;
    return this;
  }
  areaDesc(s) {
    this._p.areaDesc = String(s ?? '');
    return this;
  }

  // Crit / opposed / misc combat bonuses
  automaticCrit(b = true) {
    this._p.automaticCrit = !!b;
    return this;
  }
  critBonus(v) {
    this._p.critBonus = Number(v) || 0;
    return this;
  }
  opposedCheckBonus(v) {
    this._p.opposedCheckBonus = Number(v) || 0;
    return this;
  }
  maneuvers(arr) {
    this._p.maneuvers = Array.isArray(arr) ? arr : [];
    return this;
  }

  // Extra flags
  breakage(v) {
    this._p.breakage = Number(v) || 0;
    return this;
  }
  visibilityConditions(arr) {
    this._p.visibilityConditions = Array.isArray(arr) ? arr : [];
    return this;
  }
  concealedAmount(v) {
    this._p.concealedAmount = Number(v) || 0;
    return this;
  }
  intangible(b = true) {
    this._p.intangible = !!b;
    return this;
  }
  presence(v) {
    this._p.presence = Number(v) || 0;
    return this;
  }
  canBeCounterAttacked(b = true) {
    this._p.canBeCounterAttacked = !!b;
    return this;
  }

  // Effects on hit
  onHitEffects(arr) {
    this._p.onHitEffects = Array.isArray(arr) ? arr : [];
    return this;
  }

  // Attacker refs
  attackerId(id) {
    this._p.attackerId = String(id ?? '');
    return this;
  }
  weaponId(id) {
    this._p.weaponId = String(id ?? '');
    return this;
  }

  // Targets
  targets(arr) {
    this._p.targets = Array.isArray(arr) ? arr : [];
    return this;
  }
  addTarget(t) {
    (this._p.targets ??= []).push(t);
    return this;
  }

  build() {
    return new ABFAttackData(this._p);
  }
}
