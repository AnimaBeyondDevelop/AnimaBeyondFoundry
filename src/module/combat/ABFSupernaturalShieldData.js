import { ABFItems } from '../items/ABFItems';

export class ABFSupernaturalShieldData {
  /** @param {{name?: string, shieldPoints?: number, abilityFormula?: string, flags?: object}} p */
  constructor(p = {}) {
    this.name = String(p.name ?? '');
    this.type = ABFItems.SUPERNATURAL_SHIELD;
    this.system = {
      shieldPoints: Number(p.shieldPoints ?? 0) || 0,
      abilityFormula: String(p.abilityFormula ?? '')
    };
    this.flags = p.flags ?? undefined;
  }

  toItemCreateData() {
    const data = { name: this.name, type: this.type, system: { ...this.system } };
    if (this.flags) data.flags = this.flags;
    return data;
  }

  static builder() {
    return new ABFSupernaturalShieldDataBuilder();
  }
}

export class ABFSupernaturalShieldDataBuilder {
  constructor() {
    this._p = {};
  }

  name(v) {
    this._p.name = String(v ?? '');
    return this;
  }
  shieldPoints(v) {
    this._p.shieldPoints = Number(v) || 0;
    return this;
  }
  abilityFormula(v) {
    this._p.abilityFormula = String(v ?? '');
    return this;
  }
  flags(o) {
    this._p.flags = o ?? undefined;
    return this;
  }

  build() {
    return new ABFSupernaturalShieldData(this._p);
  }
}
