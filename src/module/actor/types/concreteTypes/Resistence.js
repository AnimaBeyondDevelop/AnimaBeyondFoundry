import { BaseType } from '../BaseType.js';

export class Resistance extends BaseType {
  static type = 'Resistance';

  static defaults() {
    return {
      base: { value: 0 },
      special: { value: 0 },
      final: { value: 0 },
      characteristicKey: ''
    };
  }

  getDerivedFlowSpecs() {
    return [
      {
        id: 'final',
        deps: ['base.value', 'special.value', 'characteristicKey'],
        mods: ['final.value'],
        compute: this.#computeFinal.bind(this)
      }
    ];
  }

  #computeFinal({ base = 0, special = 0 }) {
    const key = this._get('characteristicKey', '');
    const charFinal = this.getValueByKey('Characteristic', key, 'final.value') ?? 0;
    return { final: base + special + charFinal };
  }
}
