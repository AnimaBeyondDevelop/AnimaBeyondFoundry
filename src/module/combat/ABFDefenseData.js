export class ABFDefenseData {
  constructor(p = {}) {
    this.defenseAbility = p.defenseAbility ?? 0;
    this.armor = p.armor ?? 0;
    this.inmodifiableArmor = !!p.inmodifiableArmor;
    this.canCounterAttack = p.canCounterAttack ?? true;
    this.damageReduction = p.damageReduction ?? 0;

    // Meta
    this.defenseType = p.defenseType ?? 'dodge';
    this.defenderId = p.defenderId ?? '';
    this.defenderTokenId = p.defenderTokenId ?? '';
    this.weaponId = p.weaponId ?? '';
    this.shieldId = p.shieldId ?? '';

    // Defense rules
    this.stackDefense = !!p.stackDefense;
    this.applyMultipleDefensePenalty = !!p.applyMultipleDefensePenalty;
    this.projectilePenalty = Number(p.projectilePenalty ?? 0) || 0;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(x) {
    const o = typeof x === 'string' ? JSON.parse(x) : x;
    return new ABFDefenseData(o);
  }

  static builder() {
    return new ABFDefenseDataBuilder();
  }
}

export class ABFDefenseDataBuilder {
  constructor() {
    this._p = {};
  }

  defenseAbility(v) {
    this._p.defenseAbility = Number(v) || 0;
    return this;
  }

  armor(v) {
    this._p.armor = Number(v) || 0;
    return this;
  }

  inmodifiableArmor(b = true) {
    this._p.inmodifiableArmor = !!b;
    return this;
  }

  canCounterAttack(b = true) {
    this._p.canCounterAttack = !!b;
    return this;
  }

  damageReduction(v) {
    this._p.damageReduction = Number(v) || 0;
    return this;
  }

  defenderTokenId(id) {
    this._p.defenderTokenId = String(id ?? '');
    return this;
  }

  defenseType(s) {
    this._p.defenseType = String(s ?? 'dodge');
    return this;
  }

  defenderId(id) {
    this._p.defenderId = String(id ?? '');
    return this;
  }

  weaponId(id) {
    this._p.weaponId = String(id ?? '');
    return this;
  }

  shieldId(id) {
    this._p.shieldId = String(id ?? '');
    return this;
  }

  stackDefense(b = true) {
    this._p.stackDefense = !!b;
    return this;
  }

  applyMultipleDefensePenalty(b = true) {
    this._p.applyMultipleDefensePenalty = !!b;
    return this;
  }

  projectilePenalty(v) {
    this._p.projectilePenalty = Number(v) || 0;
    return this;
  }

  build() {
    return new ABFDefenseData(this._p);
  }
}
