import {
  ATTRIBUTE_DERIVATION_MAP,
  inferAttributeFromFlavor
} from './attributeDerivationMap.js';

describe('ATTRIBUTE_DERIVATION_MAP', () => {
  it('includes the expected paths per attribute', () => {
    expect(ATTRIBUTE_DERIVATION_MAP.attack).toContain('system.combat.attack.final.value');
    expect(ATTRIBUTE_DERIVATION_MAP.attack).toContain('system.general.modifiers.physicalActions.final.value');
    expect(ATTRIBUTE_DERIVATION_MAP.block).toContain('system.combat.block.final.value');
    expect(ATTRIBUTE_DERIVATION_MAP.dodge).toContain('system.combat.dodge.final.value');
    expect(ATTRIBUTE_DERIVATION_MAP.magicProjectionOffensive).toContain('system.mystic.magicProjection.imbalance.offensive.final.value');
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

});
