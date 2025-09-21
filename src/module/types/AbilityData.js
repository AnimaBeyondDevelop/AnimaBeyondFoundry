export class AbilityData {
  /** @param {Partial<AbilityData>} p */
  constructor(p = {}) {
    this.naturalBase = Number(p.naturalBase ?? 0); // natural base value
    this.finalBase = Number(p.finalBase ?? 0);     // final base value (after mods)
  }

  toJSON() { return { ...this }; }
  static fromJSON(json) {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    return new AbilityData(obj);
  }

  static builder() { return new AbilityDataBuilder(); }
}

export class AbilityDataBuilder {
  constructor() { this._p = {}; }
  naturalBase(v) { this._p.naturalBase = Number(v) || 0; return this; }
  finalBase(v) { this._p.finalBase = Number(v) || 0; return this; }
  build() { return new AbilityData(this._p); }
}