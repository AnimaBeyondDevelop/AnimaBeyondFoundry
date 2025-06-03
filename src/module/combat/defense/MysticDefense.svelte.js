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
   * @type {"override" | "accumulated" | "innate" | "prepared"}
   */
  castMethod = $state(this.defender.getCastMethodOverride() ? 'override' : 'accumulated');
  /**
   * ID of the used supernatural Shield.
   * @type {string}
   */
  #supernaturalShield = $state('');
  /** @type {boolean} */
  newShield = $state(this.availableSupernaturalShields.length === 0);
  /** @type {number} */
  zeonAccumulated = $derived(this.defender.system.mystic.zeon.accumulated);

  /**
   * @param {import('../attack').Attack} attack The attack to defend against
   */
  constructor(attack) {
    super(attack);

    this.spell = this.defender.getLastSpellUsed('defensive') ?? this.availableSpells[0];
    if (!this.newShield) {
      this.supernaturalShield = this.defender.system.combat.supernaturalShields[0];
    }
    this.ability.base =
      this.defender.system.mystic.magicProjection.imbalance.defensive.final.value;
  }

  /** @param {import("@module/combat/results/CombatResults.svelte").CombatResults} results */
  async onApply(results) {
    if (this.newShield) {
      this.defender.castSpell(this.spell, this.spellGrade, this.castMethod);
      this.newShield = false;
      this.#supernaturalShield = await this.defender.newSupernaturalShield(
        'mystic',
        undefined,
        undefined,
        this.spell,
        this.spellGrade
      );
    }
    if (results.supernaturalShieldDamage) {
      this.defender.applyDamageSupernaturalShield(
        this.#supernaturalShield,
        results.supernaturalShieldDamage
      );
    }
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
    return this.defender.canCastSpell(this.spell, this.spellGrade, this.castMethod);
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

  onDefend() {
    if (this.newShield) {
      if (!this.defender.canCastSpell(this.spell, this.spellGrade, this.castMethod)) {
        this.castMethod = 'override';
        throw new Error(
          `Spell ${this.spell.id} cannot be casted by actor (${this.defender.id}) ` +
            `at grade ${this.spellGrade}`
        );
      }
      this.defender.setCastMethodOverride(this.castMethod);
      this.defender.setLastSpellUsed(this.spell, 'defensive');
    }
    return super.onDefend();
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
    this.newShield = spellId !== undefined;

    const spell = this.availableSpells.find(s => s.id === spellId);
    if (spell) {
      this.#spell = spell.id ?? '';

      this.castMethod = castMethod;
      this.spellGrade = spellGrade;
    }

    const supernaturalShield = this.availableSupernaturalShields.find(
      s => s.id === supernaturalShieldId
    );
    if (supernaturalShield) {
      this.supernaturalShield = supernaturalShield;
    }

    if (!supernaturalShield && !spell) {
      throw new Error(
        `Either spell or supernaturalSield must be specified for a MysticDefense.`
      );
    }

    return this;
  }
}

Defense.registerDefenseClass(MysticDefense);
