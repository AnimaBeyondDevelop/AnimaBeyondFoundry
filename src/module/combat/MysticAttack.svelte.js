import { Attack } from './Attack.svelte';
import { damageCheck } from '@module/combat/utils/damageCheck.js';
import { resistanceEffectCheck } from '@module/combat/utils/resistanceEffectCheck.js';

/**
 * @import ABFItem from '@module/items/ABFItem.js';
 */

export class MysticAttack extends Attack {
  /** @type {'mystic'} */
  type = 'mystic';
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
   * @type {string}
   */
  castMethod = $state('accumulated');

  /**
   * @param {Token} attacker The attacker token.
   * @param {Token} defender The defender token.
   * @param {number} [counterattackBonus] Counterattack bonus or undefined if this is not a counterattack.
   */
  constructor(attacker, defender, counterattackBonus) {
    super(attacker, defender, counterattackBonus);

    this.spell = this.attacker.getLastSpellUsed('offensive') ?? this.availableSpells[0];
    this.ability.base =
      this.attacker.system.mystic.magicProjection.imbalance.offensive.final.value;
    this.zeonAccumulated = this.attacker.system.mystic.zeon.accumulated;
  }

  get availableSpells() {
    return this.attacker.getKnownSpells('attack');
  }

  get spell() {
    return this.availableSpells.find(w => w.id === this.#spell);
  }

  /** @param {ABFItem} spell */
  set spell(spell) {
    if (!spell) return;

    this.#spell = spell.id ?? '';
    this.spellGrade = 'base';
    this.critic = spell.system.critic.value;
  }

  set spellGrade(spellGrade) {
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
    return this.attacker.canCast(this.spell, this.spellGrade, this.castMethod);
  }

  get mastery() {
    return (
      this.attacker.system.mystic.magicProjection.imbalance.offensive.base.value >= 200
    );
  }

  toMessage() {
    let flavor = game.i18n.format('macros.combat.dialog.magicAttack.title', {
      spell: this.spell?.name,
      target: this._defenderToken.name
    });
    super.toMessage(flavor);
  }

  get resistanceEffect() {
    let spellEffect = this.spell?.system.grades[this.spellGrade].description.value;
    return resistanceEffectCheck(spellEffect);
  }
}
