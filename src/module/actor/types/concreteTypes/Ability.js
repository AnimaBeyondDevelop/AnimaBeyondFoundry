import { BaseType } from '../BaseType.js';

export class Ability extends BaseType {
  static type = 'Ability';

  get base() {
    return this._get('base.value', 0);
  }
  get special() {
    return this._get('special.value', 0);
  }

  get attribute() {
    return this._get('attribute', null);
  }

  // computeFinal() {
  //   return this.base + this.special;
  // }

  // applyDerived() {
  //   this._set('final.value', this.computeFinal());
  // }

  static defaults() {
    return {
      base: { value: 0 },
      special: { value: 0 },
      final: { value: 0 },
      attribute: null
    };
  }

  getDerivedFlowSpecs() {
    return [
      {
        id: 'final',
        deps: ['base.value', 'special.value'],
        mods: ['final.value'],
        compute: this.#computeFinal.bind(this)
      }
    ];
  }

  /** @param {{ base:number, special:number }} inputs */
  #computeFinal({ base = 0, special = 0 }) {
    return { final: base + special };
  }
}
