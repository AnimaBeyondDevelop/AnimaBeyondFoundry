import { Attack } from './Attack.svelte';

export class PhysicAttack extends Attack {
  /** @type {'physic'} */
  type = 'physic';
  /**
   * ID of the used weapon, set to "unarmed" if none used. Initialised to the last wapon used.
   * @type {string}
   */
  #weapon = $state('unarmed');

  /**
   * For throwable weapons, whether the attack was mele or throwing.
   * @type {boolean}
   */
  thrown = $state(false);

  /**
   * @type {Record<string,import('@module/common/ModifiedAbility.svelte').ModifierSpec>}
   */
  #modifiers = {
    fatigue: { value: 0, spec: 15, active: true },
    highGround: { value: 1, spec: 20, active: false },
    secondaryCritic: {
      value: () => (this.critic === this.weapon.system.critic.secondary.value ? 1 : 0),
      spec: -10,
      active: true
    },
    poorVisibility: { value: () => (this.isRanged ? 1 : 0), spec: -20, active: false },
    targetInCover: { value: () => (this.isRanged ? 1 : 0), spec: -40, active: false },
    pointBlank: { value: () => (this.isRanged ? 1 : 0), spec: -30, active: false }
  };

  #unarmed = {
    id: 'unarmed',
    name: game.i18n?.localize('macros.combat.dialog.unarmed.title'),
    system: {
      attack: this.attacker.system.combat.attack,
      critic: { primary: { value: 'impact' }, secondary: { value: '-' } },
      isRanged: { value: false },
      damage: {
        base: { value: 10 },
        final: {
          value: 10 + this.attacker.system.characteristics.primaries.strength.mod
        }
      }
    }
  };

  /**
   * @param {import('@module/actor/ABFActor').ABFActor} attacker The attacker actor.
   * @param {boolean} [visible=true] Whether the attack is visible or not. Defaults to `true`.
   * @param {number} [counterattackBonus] Counterattack bonus or undefined if this is not a counterattack.
   */
  constructor(attacker, visible = true, counterattackBonus) {
    super(attacker, visible, counterattackBonus);

    this.weapon =
      this.attacker.getLastWeaponUsed('offensive') ?? this.attacker.getWeapons()[0];

    this.ability.registerModTable(this.#modifiers);
  }

  get modifiers() {
    return this.#modifiers;
  }

  get availableWeapons() {
    return [...this.attacker.getWeapons(), this.#unarmed];
  }

  get weapon() {
    return this.availableWeapons.find(w => w.id === this.#weapon) ?? this.#unarmed;
  }

  set weapon(weapon) {
    this.#weapon = weapon?.id ?? 'unarmed';
    weapon = this.weapon;
    this.ability.base = weapon.system.attack.final.value;
    this.damage.base = weapon.system.damage.final.value;
    this.critic = weapon.system.critic.primary.value;

    if (!this.isThrownable) {
      this.thrown = false;
    }
  }

  /** @return {boolean} */
  get isRanged() {
    return this.isProjectile || (this.isThrownable && this.thrown);
  }

  /** @return {"shot" | "throw" | undefined} */
  get rangedType() {
    if (!this.weapon.system.isRanged.value) return undefined;
    return this.weapon.system.shotType.value;
  }

  get isProjectile() {
    return this.rangedType === 'shot';
  }

  get isThrownable() {
    return this.rangedType === 'throw';
  }
}
