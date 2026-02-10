import { BaseType } from '../BaseType.js';
import { calculateAttributeModifier } from '../../utils/prepareActor/calculations/util/calculateAttributeModifier.js';
//src/module/actor/

export class Characteristic extends BaseType {
  static type = 'Characteristic';

  get base() {
    return this._get('base.value', 0);
  }
  get special() {
    return this._get('special.value', 0);
  }
  get final() {
    return this._get('final.value', 0);
  }

  // computeFinal() {
  //   return Math.min(Math.max(this.base + this.special, 0), 20);
  // }

  // applyDerived() {
  //   const ensureObj = path => {
  //     const cur = this._get(path, null);
  //     if (!cur || typeof cur !== 'object') {
  //       this._set(path, { value: Number(cur) || 0 });
  //     }
  //   };

  //   ensureObj('base');
  //   ensureObj('special');
  //   ensureObj('final');
  //   ensureObj('mod');

  //   this._set('final.value', this.computeFinal());
  //   this._set('mod.value', calculateAttributeModifier(this.final));
  // }

  static defaults() {
    return {
      base: { value: 0 },
      special: { value: 0 },
      final: { value: 0 },
      mod: { value: 0 }
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

    // legacy: { mod: number } -> mod.value
    if (
      out.mod !== undefined &&
      (typeof out.mod === 'number' || typeof out.mod === 'string')
    ) {
      out.mod = { value: Number(out.mod) || 0 };
    }

    return out;
  }

  static editorConfig() {
    return {
      readonly: ['final.value', 'mod.value'],
      hidden: [],
      labels: {
        'base.value': 'Base',
        'special.value': 'Special',
        'final.value': 'Final',
        'mod.value': 'Mod'
      },
      order: ['base.value', 'special.value', 'final.value', 'mod.value'],
      overrides: {}
    };
  }

  getDerivedFlowSpecs() {
    return [
      {
        id: 'final',
        deps: ['base.value', 'special.value'],
        mods: ['final.value'],
        compute: this.#computeFinal.bind(this)
      },
      {
        id: 'mod',
        deps: ['final.value'],
        mods: ['mod.value'],
        compute: this.#computeMod.bind(this)
      }
    ];
  }

  /** @param {{ base:number, special:number }} inputs */
  #computeFinal({ base = 0, special = 0 }) {
    const final = Math.min(Math.max(base + special, 0), 20);
    return { final };
  }

  /** @param {{ final:number }} inputs */
  #computeMod({ final = 0 }) {
    return { mod: calculateAttributeModifier(final) };
  }
}
