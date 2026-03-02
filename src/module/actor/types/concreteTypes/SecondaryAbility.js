import { Ability } from './Ability.js';
import { calculateAttributeModifier } from '../../utils/prepareActor/calculations/util/calculateAttributeModifier.js';

export class SecondaryAbility extends Ability {
  static type = 'SecondaryAbility';

  get attributeBonusAmount() {
    return this._get('attributeBonusAmount', 0);
  }

  get naturalBonusAmount() {
    return this._get('naturalBonusAmount', 0);
  }

  get applyPerceptionPenalty() {
    return this._get('applyPerceptionPenalty', false);
  }

  get applyNaturalPenalty() {
    return this._get('applyNaturalPenalty', false);
  }

  get maxNaturalPenaltyReductionPercentage() {
    return this._get('maxNaturalPenaltyReductionPercentage', 100);
  }

  static defaults() {
    return {
      ...super.defaults(),
      attributeBonusAmount: 0,
      naturalBonusAmount: 0,
      applyPerceptionPenalty: false,
      applyNaturalPenalty: false,
      maxNaturalPenaltyReductionPercentage: 100
    };
  }

  static normalizeInflateInput(node) {
    const out = super.normalizeInflateInput(node);
    if (!out || typeof out !== 'object') return out;

    // Migrate legacy shape: attribute.value -> attribute
    if (
      out.attribute &&
      typeof out.attribute === 'object' &&
      !Array.isArray(out.attribute) &&
      'value' in out.attribute
    ) {
      out.attribute = out.attribute.value;
    }

    // Ensure types
    if (!Number.isFinite(Number(out.attributeBonusAmount))) out.attributeBonusAmount = 0;
    else out.attributeBonusAmount = Number(out.attributeBonusAmount);

    if (!Number.isFinite(Number(out.naturalBonusAmount))) out.naturalBonusAmount = 0;
    else out.naturalBonusAmount = Number(out.naturalBonusAmount);

    return out;
  }

  static normalizeInflateInput(node) {
    const out = super.normalizeInflateInput(node);
    if (!out || typeof out !== 'object') return out;

    return out;
  }

  static editorConfig() {
    const base = super.editorConfig();

    return {
      ...base,
      labels: {
        ...(base.labels ?? {}),
        attributeBonusAmount: 'Attribute bonus',
        naturalBonusAmount: 'Natural bonus',
        applyPerceptionPenalty: 'Apply perception penalty',
        applyNaturalPenalty: 'Apply natural penalty',
        maxNaturalPenaltyReductionPercentage: 'Max natural mod reduction (%)'
      },
      order: [
        ...(base.order ?? []),
        'attributeBonusAmount',
        'naturalBonusAmount',
        'applyPerceptionPenalty',
        'applyNaturalPenalty',
        'maxNaturalPenaltyReductionPercentage'
      ]
    };
  }

  _computeFinal({ base = 0, special = 0 }) {
    // Keep parent logic (allActions/physicalActions, etc.)
    return super._computeFinal({ base, special });
  }

  /**
   *
   * Calculates ability mod
   * @returns {Number}
   */
  _computeMods() {
    let result = super._computeMods();

    if (this.applyPerceptionPenalty) {
      result += Number(
        this.actor?.system?.general?.modifiers?.perceptionPenalty?.final?.value ?? 0
      );
    }

    if (this.applyNaturalPenalty) {
      result += Number(this.#calculateNaturalPenalty());
    }

    return Number(result);
  }
  /**
   *
   * Calculates natural penalty
   * @returns {Number}
   */
  #calculateNaturalPenalty() {
    let { naturalPenalty } = this.actor?.system?.general?.modifiers;

    //esto sirve para limitar la cantidad de penalizador que puede reducir la habilidad
    let naturalPenaltyReduction = Math.min(
      naturalPenalty.reduction.value,
      Math.floor(
        -naturalPenalty.unreduced.value *
          (this.maxNaturalPenaltyReductionPercentage / 100)
      )
    );

    //el final es el penalizador "real", restándole la reducción conseguimos el valor de penalizdor para los
    //casos normales (los que no tienen un máximo que reduce como sigilo o nadar)
    let unreducedNaturalPenalty =
      naturalPenalty.final.value - naturalPenalty.reduction.value;

    return Number(unreducedNaturalPenalty + naturalPenaltyReduction);
  }

  _computeCharacteristicDelta() {
    // In SecondaryAbility, this toggle means "compute natural bonuses"
    if (!this.computeCharacteristicMod || !this.attribute) return 0;

    const ch = this.actor?.system?.characteristics?.primaries?.[this.attribute];
    if (!ch) return 0;

    const chBase = Number(ch.base?.value ?? ch.base ?? 0);
    const chFinal = Number(ch.final?.value ?? ch.final ?? 0);

    const baseNaturalMod = this.#calculateNaturalMod(chBase);
    const finalNaturalMod = this.#calculateNaturalMod(chFinal);

    return finalNaturalMod - baseNaturalMod;
  }

  #calculateNaturalMod(characteristicValue) {
    return Math.min(
      Math.max(
        ((this.attributeBonusAmount ?? 0) + 1) *
          calculateAttributeModifier(characteristicValue) +
          (this.naturalBonusAmount ?? 0) * 10,
        0
      ),
      100
    );
  }

  getDerivedFlowSpecs() {
    const specs = super.getDerivedFlowSpecs();
    const finalSpec = specs.find(s => s.id === 'final');

    if (finalSpec) {
      finalSpec.deps = [
        ...(finalSpec.deps ?? []),
        'attributeBonusAmount',
        'naturalBonusAmount',
        'applyPerceptionPenalty',
        'maxNaturalPenaltyReductionPercentage'
      ];
      // no need to change compute: parent compute calls _computeCharacteristicDelta via polymorphism
    }

    return this._mergeInstanceDeps(specs);
  }
}
