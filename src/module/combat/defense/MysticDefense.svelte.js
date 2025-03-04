import { Defense } from './Defense.svelte';
import { shieldValueCheck } from '@module/combat/utils/shieldValueCheck.js';

/**
 * @import ABFItem from '@module/items/ABFItem.js';
 */

/**
 * @class
 * @extends Defense
 */
export class MysticDefense extends Defense {
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
   * @type {string}
   */
  castMethod = $state('accumulated');
  /**
   * ID of the used supernatural Shield.
   * @type {string}
   */
  #supernaturalShield = $state('');
  /**
   * @type {boolean}
   */
  newShield = $state(false);

  /**
   * @param {Attack} attack The attack to defend against
   */
  constructor(attack) {
    super(attack);

    this.spell = this.defender.getLastSpellUsed('defensive') ?? this.availableSpells[0];
    this.supernaturalShield = this.defender.system.combat.supernaturalShields[0];
    this.ability.base =
      this.defender.system.mystic.magicProjection.imbalance.defensive.final.value;
    this.zeonAccumulated = this.defender.system.mystic.zeon.accumulated;
    this.castMethod = this.defender.getCastMethodOverride() ? 'override' : 'accumulated';
    this.newShield = this.availableSupernaturalShields.length == 0;
  }

  get displayName() {
    return /** @type {string} */ (this.supernaturalShield.name);
  }

  get availableSpells() {
    return this.defender.getKnownSpells('defense');
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
  }

  set spellGrade(spellGrade) {
    this.#spellGrade = spellGrade;
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
      this.defender.system.characteristics.primaries.intelligence.value +
      (this.defender.system.mystic.mysticSettings.aptitudeForMagicDevelopment ? 3 : 0);
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
    return this.defender.canCast(this.spell, this.spellGrade, this.castMethod);
  }

  get mastery() {
    return (
      this.defender.system.mystic.magicProjection.imbalance.defensive.base.value >= 200
    );
  }

  get availableSupernaturalShields() {
    return this.defender.getSupernaturalShields();
  }

  get supernaturalShield() {
    let supernaturalShield = {};
    if (this.newShield) {
      supernaturalShield.name = this.spell?.name;
      supernaturalShield.system = {
        type: 'mystic',
        spellGrade: this.spellGrade,
        damageBarrier: 0,
        shieldPoints: shieldValueCheck(
          this.spell?.system.grades[this.spellGrade].description.value ?? ''
        ),
        origin: this.defender.uuid
      };
    } else {
      supernaturalShield =
        this.availableSupernaturalShields.find(w => w.id === this.#supernaturalShield) ??
        this.availableSupernaturalShields[0];
    }
    return supernaturalShield;
  }

  /** @param {ABFItem} supernaturalShield */
  set supernaturalShield(supernaturalShield) {
    if (!supernaturalShield) return;

    this.#supernaturalShield = supernaturalShield.id ?? '';
  }

  get shieldPoints() {
    return this.supernaturalShield?.system.shieldPoints;
  }

  get messageFlavor() {
    return game.i18n.format('macros.combat.dialog.magicDefense.title', {
      spell: this.supernaturalShield?.name,
      target: this.attackerToken.name
    });
  }

  toJSON() {
    return {
      ...super.toJSON(),
      spellId: this.newShield ? this.#spell : undefined,
      spellGrade: this.#spellGrade,
      castMethod: this.castMethod,
      supernaturalShieldId: this.newShield ? undefined : this.#supernaturalShield
    };
  }

  /** @param {ReturnType<MysticDefense['toJSON']>} json */
  loadJSON(json) {
    super.loadJSON(json);

    let { spellId, spellGrade, castMethod, supernaturalShieldId } = json;
    this.spell = this.availableSpells.find(s => s.id === spellId);
    this.castMethod = castMethod;
    if (!(spellGrade in this.availableSpellGrades))
      throw new Error(
        `Spell ${spellId} cannot be casted by actor (${this.defender.id}) at grade ${spellGrade}`
      );
    this.spellGrade = spellGrade;
    this.supernaturalShield = supernaturalShield;
    this.newShield = spellId != undefined;
    return this;
  }
}

Defense.registerDefenseClass(MysticDefense);
