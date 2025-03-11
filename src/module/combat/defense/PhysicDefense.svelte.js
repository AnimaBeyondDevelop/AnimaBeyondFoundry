import { Attack, PhysicAttack } from '../attack';
import { Defense } from './Defense.svelte';

/**
 * @class
 * @extends {Defense}
 */
export class PhysicDefense extends Defense {
  /** @readonly */
  static type = 'physic';
  /** @type {"dodge"|"block"} */
  #physicDefenseType = $state('dodge');
  /** @type {boolean} */
  shieldUsed = $derived(this.weapon.system.isShield.value);
  /**
   * ID of the used weapon, set to "unarmed" if none used. Initialised to the last wapon used.
   * @type {string}
   */
  #weapon = $state('unarmed');

  #unarmed = {
    id: 'unarmed',
    name: game.i18n?.localize('macros.combat.dialog.unarmed.title'),
    system: {
      block: this.attacker.system.combat.block,
      isShield: { value: false }
    }
  };
  /** @type {boolean} */
  #autoAccumulateDefenses = $state(true);

  /** @param {Attack} attack */
  constructor(attack) {
    super(attack);
    const { block, dodge } = this.defender.system.combat;
    this.physicDefenseType = block.final.value > dodge.final.value ? 'block' : 'dodge';

    this.weapon =
      this.attacker.getLastWeaponUsed('defensive') ?? this.availableWeapons[0];

    this.#autoAccumulateDefenses = this.defender.autoAccumulateDefenses;
  }

  /** @param {import("@module/combat/results/CombatResults.svelte").CombatResults} results */
  onApply(results) {
    this.defender.applyFatigue(this.ability.modifiers.fatigue.value);
  }

  get autoAccumulateDefenses() {
    return this.#autoAccumulateDefenses;
  }
  set autoAccumulateDefenses(value) {
    this.#autoAccumulateDefenses = value;
    this.defender.autoAccumulateDefenses = value;

    if (value) {
      this.ability.modifiers.cumulativeDefenses.value = Math.min(
        this.defender.accumulatedDefenses,
        4
      );
    }
  }

  get availableWeapons() {
    return [...this.defender.getWeapons(), this.#unarmed];
  }

  get weapon() {
    return this.availableWeapons.find(w => w.id === this.#weapon) ?? this.#unarmed;
  }

  set weapon(weapon) {
    this.#weapon = weapon?.id ?? 'unarmed';
    if (this.isBlock) this.ability.base = weapon.system.block.final.value;
  }

  get displayName() {
    return /** @type {string} */ (this.weapon.name);
  }

  get physicDefenseType() {
    return this.#physicDefenseType;
  }
  set physicDefenseType(value) {
    this.#physicDefenseType = value;
    if (this.isBlock) this.ability.base = this.weapon.system.block.final.value;
    if (this.isDodge) this.ability.base = this.defender.system.combat.dodge.final.value;
  }

  // Convenience getters
  get isBlock() {
    return this.physicDefenseType === 'block';
  }
  get isDodge() {
    return this.physicDefenseType === 'dodge';
  }
  get againstProjectile() {
    return (
      !(this.attack instanceof PhysicAttack) ||
      (this.attack.isRanged && this.attack.isProjectile)
    );
  }
  get againstThrown() {
    return (
      this.attack instanceof PhysicAttack &&
      this.attack.isRanged &&
      !this.attack.isProjectile
    );
  }

  get messageFlavor() {
    return game.i18n.format(
      `macros.combat.dialog.physicalDefense.${this.physicDefenseType}.title`,
      {
        target: this.attackerToken.name
      }
    );
  }

  onDefend() {
    this.defender.setLastWeaponUsed(this.weapon, 'defensive');
    return super.onDefend();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      physicDefenseType: this.#physicDefenseType,
      weaponId: this.#weapon,
      autoAccumulateDefenses: this.#autoAccumulateDefenses
    };
  }

  /** @param {ReturnType<PhysicDefense['toJSON']>} json */
  loadJSON(json) {
    super.loadJSON(json);
    let { weaponId, physicDefenseType, autoAccumulateDefenses } = json;
    this.physicDefenseType = physicDefenseType;
    const weapon = this.availableWeapons.find(w => w.id === weaponId) ?? this.#unarmed;
    if (!weapon)
      throw new Error(
        `Weapon ${weaponId} not found in actor's (${this.attacker.id}) available weapons`
      );
    this.weapon = weapon;
    this.autoAccumulateDefenses = autoAccumulateDefenses;

    return this;
  }

  /** @type {Record<string,import('@module/common/ModifiedAbility.svelte').ModifierSpec>} */
  get modifiers() {
    return {
      ...super.modifiers,
      partialBlindness: {
        value: 1,
        spec: v => v * (this.physicDefenseType === 'dodge' ? -15 : -30),
        active: false
      },
      fatigue: { value: 0, spec: 15, active: true },
      blockProjectile: {
        value: () => (this.isBlock && this.againstProjectile ? 1 : 0),
        spec: v => {
          if (v === 0) return 0;
          if (this.shieldUsed && this.mastery) return 0;
          if (this.shieldUsed) return -30;
          if (this.mastery) return -20;
          return -80;
        },
        active: true
      },
      maestryBlockProjectile: {
        value: () =>
          this.isBlock && this.againstProjectile && this.mastery && !this.shieldUsed
            ? 1
            : 0,
        spec: -20,
        active: true
      },
      shieldBlockProjectile: {
        value: () =>
          this.isBlock && this.againstProjectile && !this.mastery && this.shieldUsed
            ? 1
            : 0,
        spec: -30,
        active: true
      },
      blockThrown: {
        value: () =>
          this.isBlock && this.againstThrown && (!this.mastery || !this.shieldUsed)
            ? 1
            : 0,
        spec: -50,
        active: true
      },
      dodgeProjectile: {
        value: () => (this.isDodge && this.againstProjectile && !this.mastery ? 1 : 0),
        spec: -30,
        active: true
      },
      cumulativeDefenses: {
        value: 0,
        spec: v => {
          switch (v) {
            case 0:
              return 0;
            case 1:
              return -30;
            case 2:
              return -50;
            case 3:
              return -70;
            default:
              return -90;
          }
        },
        active: true
      }
    };
  }
}

Defense.registerDefenseClass(PhysicDefense);
