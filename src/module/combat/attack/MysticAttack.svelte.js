import { Attack } from './Attack.svelte';
import { damageCheck } from '@module/combat/utils/damageCheck.js';
import { resistanceEffectCheck } from '@module/combat/utils/resistanceEffectCheck.js';

/**
 * @import ABFItem from '@module/items/ABFItem.js';
 */

/**
 * @class
 * @extends {Attack}
 */
export class MysticAttack extends Attack {
  /** @type {'mystic'} */
  static type = 'mystic';
  /**
   * ID of the used spell. Initialised to the last spell used.
   * @type {string}
   */
  #spell = $state('');
  /**
   * The grade of the used spell. Initialised to "base".
   * @type {string}
   */
  #spellGrade = $state('base');
  /**
   * Indicates how the spell will be casted. Initialised to "accumulated".
   * @type {"override" | "accumulated" | "innate" | "prepared"}
   */
  castMethod = $state('accumulated');

  /**
   * @param {TokenDocument} attacker The attacker token.
   * @param {TokenDocument} defender The defender token.
   * @param {number} [counterattackBonus] Counterattack bonus or undefined if this is not a counterattack.
   */
  constructor(attacker, defender, counterattackBonus) {
    super(attacker, defender, counterattackBonus);

    this.spell = this.attacker.getLastSpellUsed('offensive') ?? this.availableSpells[0];
    this.ability.base =
      this.attacker.system.mystic.magicProjection.imbalance.offensive.final.value;
    this.zeonAccumulated = this.attacker.system.mystic.zeon.accumulated;
    this.castMethod = this.attacker.getCastMethodOverride() ? 'override' : 'accumulated';
  }

  get displayName() {
    return /** @type {string} */ (this.spell.name);
  }

  get availableSpells() {
    return this.attacker.getKnownSpells('attack');
  }

  get spell() {
    return (
      this.availableSpells.find(w => w.id === this.#spell) ?? this.availableSpells[0]
    );
  }

  /** @param {ABFItem} spell */
  set spell(spell) {
    if (!spell) return;

    this.#spell = spell.id ?? '';
    this.spellGrade = 'base';
    this.critic = spell.system.critic.value;
  }

  set spellGrade(spellGrade) {
    if (!this.availableSpellGrades.includes(spellGrade))
      throw new Error(
        `Spell ${this.spell.id} cannot be casted by actor (${this.attacker.id}) at grade ${spellGrade}`
      );
    this.#spellGrade = spellGrade;
    let spellEffect = this.spell?.system.grades[this.#spellGrade].description.value ?? '';
    this.damage.base = damageCheck(spellEffect);
  }

  get spellGrade() {
    return this.#spellGrade;
  }

  get availableSpellGrades() {
    if (this.castMethod === 'override') {
      return ['base', 'intermediate', 'advanced', 'arcane'];
    }
    let availableSpellGrades = [];
    let intelligence =
      this.attacker.system.characteristics.primaries.intelligence.value +
      (this.attacker.system.mystic.mysticSettings.aptitudeForMagicDevelopment ? 3 : 0);
    for (let grade in this.spell.system.grades) {
      if (intelligence >= this.spell.system.grades[grade].intRequired.value) {
        availableSpellGrades.push(grade);
      }
    }
    return availableSpellGrades;
  }

  get zeonCost() {
    return this.spell?.system.grades[this.spellGrade].zeon.value;
  }

  get canCast() {
    return this.attacker.canCastSpell(this.spell, this.spellGrade, this.castMethod);
  }

  get visible() {
    return this.spell?.system.visible ?? true;
  }

  get mastery() {
    return (
      this.attacker.system.mystic.magicProjection.imbalance.offensive.base.value >= 200
    );
  }

  get messageFlavor() {
    return game.i18n.format('macros.combat.dialog.magicAttack.title', {
      spell: this.spell?.name,
      target: this.defenderToken.name
    });
  }

  get resistanceEffect() {
    let spellEffect = this.spell?.system.grades[this.spellGrade].description.value;
    return resistanceEffectCheck(spellEffect);
  }

  onAttack() {
    this.attacker.setLastSpellUsed(this.spell, 'offensive');
    this.attacker.setCastMethodOverride(this.castMethod);
    if (!this.attacker.canCastSpell(this.spell, this.spellGrade, this.castMethod)) {
      this.castMethod = 'override';
      throw new Error(
        `Spell ${this.spell.id} cannot be casted by actor (${this.defender.id}) ` +
          `at grade ${this.spellGrade}`
      );
    }
    return super.onAttack();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      spellId: this.#spell,
      spellGrade: this.#spellGrade,
      castMethod: this.castMethod
    };
  }

  /** @param {ReturnType<MysticAttack['toJSON']>} json */
  loadJSON(json) {
    super.loadJSON(json);

    let { spellId, spellGrade, castMethod } = json;
    const spell = this.availableSpells.find(s => s.id === spellId);
    if (!spell)
      throw new Error(
        `Spell ${spellId} not found in actor's (${this.attacker.id}) available spells`
      );
    this.spell = spell;
    this.castMethod = castMethod;
    this.spellGrade = spellGrade;
    return this;
  }
}

Attack.registerAttackClass(MysticAttack);
