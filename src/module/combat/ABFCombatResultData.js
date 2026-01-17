export class ABFCombatResultData {
  /** @param {Partial<ABFCombatResultData>} p */
  constructor(p = {}) {
    this.difference = p.difference ?? 0; // Diferencia
    this.counterAttackValue = p.counterAttackValue ?? 0; // Valor de contraataque
    this.hasCounterAttack = p.hasCounterAttack ?? false; // ¿Hay contraataque?
    this.damageFinal = p.damageFinal ?? 0; // Daño final
    this.lifePercentRemoved = p.lifePercentRemoved ?? 0; // % de vida quitada
    this.isCritical = p.isCritical ?? false; // ¿Es crítico?
    this.baseCriticalValue = p.baseCriticalValue ?? 0; // Valor base del crítico
    this.attackBreak = p.attackBreak ?? 0; // Rotura del ataque
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(json) {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    return new ABFCombatResultData(obj);
  }

  /** Fluent builder */
  static builder() {
    return new ABFCombatResultDataBuilder();
  }
}

export class ABFCombatResultDataBuilder {
  constructor() {
    this._p = {};
  }

  difference(v) {
    this._p.difference = Number(v) || 0;
    return this;
  }
  counterAttackValue(v) {
    this._p.counterAttackValue = Number(v) || 0;
    return this;
  }
  hasCounterAttack(v) {
    this._p.hasCounterAttack = !!v;
    return this;
  }
  damageFinal(v) {
    this._p.damageFinal = Number(v) || 0;
    return this;
  }
  lifePercentRemoved(v) {
    this._p.lifePercentRemoved = Number(v) || 0;
    return this;
  }
  isCritical(v) {
    this._p.isCritical = !!v;
    return this;
  }
  baseCriticalValue(v) {
    this._p.baseCriticalValue = Number(v) || 0;
    return this;
  }
  attackBreak(v) {
    this._p.attackBreak = Number(v) || 0;
    return this;
  }

  build() {
    return new ABFCombatResultData(this._p);
  }
}
