import { BaseType } from '../BaseType.js';
import { FormulaEvaluator } from '../../../../utils/formulaEvaluator.js';

export class NumericalValue extends BaseType {
  static type = 'NumericalValue';

  get base() {
    return this._get('base.value', 0);
  }
  get special() {
    return this._get('special.value', 0);
  }
  get final() {
    return this._get('final.value', 0);
  }

  get formula() {
    return this._get('formula', '');
  }

  get calculateBaseFromFormula() {
    return this._get('calculateBaseFromFormula', false);
  }

  static defaults() {
    return {
      formula: '',
      calculateBaseFromFormula: false,
      base: { value: 0 },
      special: { value: 0 },
      final: { value: 0 }
    };
  }

  static normalizeInflateInput(node) {
    if (!node || typeof node !== 'object') return node;

    const out = { ...node };

    // legacy: { value: number } -> base.value
    if (out.value !== undefined && out.base === undefined) {
      out.base = { value: Number(out.value) || 0 };
      delete out.value;
    }

    if (typeof out.formula !== 'string') out.formula = '';
    if (typeof out.calculateBaseFromFormula !== 'boolean') {
      out.calculateBaseFromFormula = false;
    }

    return out;
  }

  static editorConfig() {
    return {
      readonly: ['final.value'],
      hidden: [],
      labels: {
        formula: 'Formula',
        calculateBaseFromFormula: 'Calculate base from formula',
        'base.value': 'Base',
        'special.value': 'Special',
        'final.value': 'Final'
      },
      order: [
        'formula',
        'calculateBaseFromFormula',
        'base.value',
        'special.value',
        'final.value'
      ]
    };
  }

  getDerivedFlowSpecs() {
    const specs = [
      {
        id: 'baseFromFormula',
        deps: ['formula', 'calculateBaseFromFormula'],
        mods: ['base.value'],
        compute: this.#computeBaseFromFormula.bind(this)
      },
      {
        id: 'final',
        deps: ['base.value', 'special.value'],
        mods: ['final.value'],
        compute: this.#computeFinal.bind(this)
      }
    ];

    // ---- Dynamic deps from formula ----
    const useFormula = Boolean(this._get('calculateBaseFromFormula', false));
    const formula = String(this._get('formula', '') ?? '').trim();

    if (useFormula && formula) {
      // "system.xxx" paths so the flow can track real actor dependencies
      const deps = FormulaEvaluator.getDependencies(formula);
      this.setInstanceDeps('baseFromFormula', deps);
    } else {
      this.clearInstanceDeps('baseFromFormula');
    }

    return this._mergeInstanceDeps(specs);
  }

  #computeBaseFromFormula({ formula = '', calculateBaseFromFormula = false }) {
    if (!calculateBaseFromFormula || !formula) return {};
    const v = FormulaEvaluator.evaluate(String(formula), this.actor);
    const n = Number(v);
    return { base: Number.isFinite(n) ? n : 0 };
  }

  /** @param {{ base:number, special:number }} inputs */
  #computeFinal({ base = 0, special = 0 }) {
    return { final: base + special };
  }
}
