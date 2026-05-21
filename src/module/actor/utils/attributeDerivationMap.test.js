import {
  ATTRIBUTE_DERIVATION_MAP,
  inferAttributeFromFlavor
} from './attributeDerivationMap.js';

describe('ATTRIBUTE_DERIVATION_MAP', () => {
  it('lists multiple contributing paths for combat attributes', () => {
    expect(ATTRIBUTE_DERIVATION_MAP.attack).toContain('system.combat.attack.final.value');
    expect(ATTRIBUTE_DERIVATION_MAP.attack).toContain('system.general.modifiers.physicalActions.final.value');
  });

  it('block and dodge follow the same shape as attack', () => {
    expect(ATTRIBUTE_DERIVATION_MAP.block).toContain('system.combat.block.final.value');
    expect(ATTRIBUTE_DERIVATION_MAP.dodge).toContain('system.combat.dodge.final.value');
    expect(ATTRIBUTE_DERIVATION_MAP.block).toContain('system.general.modifiers.physicalActions.final.value');
    expect(ATTRIBUTE_DERIVATION_MAP.dodge).toContain('system.general.modifiers.physicalActions.final.value');
  });

  it('magic and psychic projection have offensive/defensive variants', () => {
    expect(ATTRIBUTE_DERIVATION_MAP.magicProjectionOffensive).toContain('system.mystic.magicProjection.imbalance.offensive.final.value');
    expect(ATTRIBUTE_DERIVATION_MAP.magicProjectionDefensive).toContain('system.mystic.magicProjection.imbalance.defensive.final.value');
    expect(ATTRIBUTE_DERIVATION_MAP.psychicProjectionOffensive).toContain('system.psychic.psychicProjection.imbalance.offensive.final.value');
    expect(ATTRIBUTE_DERIVATION_MAP.psychicProjectionDefensive).toContain('system.psychic.psychicProjection.imbalance.defensive.final.value');
  });
});

describe('inferAttributeFromFlavor', () => {
  it('returns null on empty or unrecognized flavor', () => {
    expect(inferAttributeFromFlavor('')).toBeNull();
    expect(inferAttributeFromFlavor('Some random text')).toBeNull();
    expect(inferAttributeFromFlavor(null)).toBeNull();
    expect(inferAttributeFromFlavor(undefined)).toBeNull();
  });

  it('detects attack from Spanish and English flavors', () => {
    expect(inferAttributeFromFlavor('Rolling attack')).toBe('attack');
    expect(inferAttributeFromFlavor('Ataque físico con Hacha de guerra')).toBe('attack');
    expect(inferAttributeFromFlavor('PhysicalAttack: ataque')).toBe('attack');
  });

  it('detects block (parada)', () => {
    expect(inferAttributeFromFlavor('Rolling parada')).toBe('block');
    expect(inferAttributeFromFlavor('Block roll')).toBe('block');
  });

  it('detects dodge (esquiva)', () => {
    expect(inferAttributeFromFlavor('Rolling esquiva')).toBe('dodge');
    expect(inferAttributeFromFlavor('Dodge')).toBe('dodge');
  });

  it('detects initiative', () => {
    expect(inferAttributeFromFlavor('Iniciativa')).toBe('initiative');
    expect(inferAttributeFromFlavor('Rolling initiative')).toBe('initiative');
  });

  it('detects magic projection — offensive when no defensive keyword', () => {
    expect(inferAttributeFromFlavor('Rolling proyección mágica ofensiva')).toBe('magicProjectionOffensive');
    expect(inferAttributeFromFlavor('Magic projection roll')).toBe('magicProjectionOffensive');
  });

  it('detects magic projection defensive', () => {
    expect(inferAttributeFromFlavor('Rolling proyección mágica defensiva')).toBe('magicProjectionDefensive');
  });

  it('detects psychic projection variants', () => {
    expect(inferAttributeFromFlavor('Proyección psíquica ofensiva')).toBe('psychicProjectionOffensive');
    expect(inferAttributeFromFlavor('Proyección psíquica defensiva')).toBe('psychicProjectionDefensive');
  });

  it('handles missing accents (proyeccion magica)', () => {
    expect(inferAttributeFromFlavor('proyeccion magica')).toBe('magicProjectionOffensive');
  });
});
