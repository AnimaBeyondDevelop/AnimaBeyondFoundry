import { NumericalValue } from './NumericalValue.js';
import { calculateAttributeModifier } from '../../utils/prepareActor/calculations/util/calculateAttributeModifier.js';

export class AffectedByCharacteristicValue extends NumericalValue {
  static type = 'AffectedByCharacteristicValue';

  get attribute() {
    return this._get('attribute', null);
  }

  get computeCharacteristicMod() {
    return this._get('computeCharacteristicMod', true);
  }

  static defaults() {
    return {
      ...super.defaults(),
      attribute: null,
      computeCharacteristicMod: true
    };
  }

  static normalizeInflateInput(node) {
    const out = super.normalizeInflateInput(node);
    if (!out || typeof out !== 'object') return out;

    if (out.attribute === undefined) out.attribute = null;

    if (typeof out.computeCharacteristicMod !== 'boolean') {
      out.computeCharacteristicMod = true;
    }

    return out;
  }

  static editorConfig() {
    const base = super.editorConfig();

    return {
      ...base,
      labels: {
        ...(base.labels ?? {}),
        attribute: 'Attribute',
        computeCharacteristicMod: 'Add characteristic mod delta'
      },
      order: [...(base.order ?? []), 'attribute', 'computeCharacteristicMod'],
      overrides: {
        ...(base.overrides ?? {}),
        attribute: { kind: 'select' }
      }
    };
  }

  static getEditorFieldOptions(actor) {
    const options = [];

    const byKey = actor?.typedRepo?.get('Characteristic');
    if (byKey && typeof byKey.values === 'function') {
      for (const node of byKey.values()) {
        if (!node?.key) continue;
        options.push({ value: node.key, label: node.key });
      }
    }

    options.sort((a, b) => a.label.localeCompare(b.label));
    return { attribute: options };
  }

  /**
   * "Protected" method intended to be overridden by subclasses.
   * Calculates the delta produced by the characteristic.
   */
  _computeCharacteristicDelta() {
    if (!this.computeCharacteristicMod || !this.attribute) return 0;

    const ch = this.actor?.system?.characteristics?.primaries?.[this.attribute];
    if (!ch) return 0;

    const chBase = Number(ch.base?.value ?? ch.base ?? 0);
    const chFinal = Number(ch.final?.value ?? ch.final ?? 0);

    return calculateAttributeModifier(chFinal) - calculateAttributeModifier(chBase);
  }

  _computeFinal({ base = 0, special = 0 }) {
    const { final } = super._computeFinal({ base, special });

    const delta = this._computeCharacteristicDelta();

    return { final: final + delta };
  }

  getDerivedFlowSpecs() {
    const specs = super.getDerivedFlowSpecs();
    const finalSpec = specs.find(s => s.id === 'final');

    if (finalSpec) {
      finalSpec.deps = [
        'base.value',
        'special.value',
        'attribute',
        'computeCharacteristicMod'
      ];
      finalSpec.compute = this._computeFinal.bind(this);

      if (this.computeCharacteristicMod && this.attribute) {
        const chPath = `system.characteristics.primaries.${this.attribute}`;
        this.setInstanceDeps('final', [`${chPath}.base.value`, `${chPath}.final.value`]);
      } else {
        this.clearInstanceDeps('final');
      }
    }

    return this._mergeInstanceDeps(specs);
  }
}
