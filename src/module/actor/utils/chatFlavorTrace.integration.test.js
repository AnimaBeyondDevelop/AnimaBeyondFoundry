import { inferAttributeFromFlavor } from './attributeDerivationMap.js';
import { getActiveEffectsBreakdownForAttribute } from './activeEffectsBreakdown.js';
import { formatAeBreakdownForFlavor } from './aeBreakdownFormat.js';

/**
 * End-to-end traceability flow (no Foundry dependencies).
 *
 * Simulates exactly what the preCreateChatMessage hook in animabf.mjs does:
 *   roll flavor -> inferAttributeFromFlavor -> attribute key
 *   actor + attribute -> getActiveEffectsBreakdownForAttribute -> breakdown
 *   breakdown -> formatAeBreakdownForFlavor -> HTML suffix
 *
 * IMPORTANT: per the Anima Beyond Fantasy rules, the physicalActions
 * modifier is NOT applied to attack/block/dodge (those are primary combat
 * skills). physicalActions only affects contested secondary skills. The
 * derivation map and these tests reflect that: only AE that touch the
 * attribute's own paths contribute to its flavor.
 */

const ATTACK_PATH = 'system.combat.attack.final.value';
const BLOCK_PATH = 'system.combat.block.final.value';
const DODGE_PATH = 'system.combat.dodge.final.value';
const PHYSICAL_PATH = 'system.general.modifiers.physicalActions.final.value';
const INITIATIVE_PATH = 'system.characteristics.secondaries.initiative.final.value';
const MAGIC_OFFENSIVE_PATH = 'system.mystic.magicProjection.imbalance.offensive.final.value';
const PSYCHIC_OFFENSIVE_PATH = 'system.psychic.psychicProjection.imbalance.offensive.final.value';

const mkActor = (effects) => ({
  _source: { system: {} },
  system: {},
  effects: { contents: effects }
});

const mkEffect = (id, name, changes, opts = {}) => ({
  id,
  name,
  active: opts.active ?? true,
  changes,
  system: {}
});

function runFlavorPipeline(actor, flavor) {
  const attribute = inferAttributeFromFlavor(flavor);
  if (!attribute) return { attribute: null, breakdown: null, suffix: '' };
  const breakdown = getActiveEffectsBreakdownForAttribute(actor, attribute);
  const suffix = formatAeBreakdownForFlavor(breakdown);
  return { attribute, breakdown, suffix };
}

describe('end-to-end flavor trace pipeline', () => {
  describe('Ataque', () => {
    it('lists an AE that targets attack.final directly (Sangre de Orochi)', () => {
      const actor = mkActor([
        mkEffect('orochi', 'Sangre de Orochi', [
          { key: ATTACK_PATH, value: '20', type: 'add' }
        ])
      ]);

      const { attribute, suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(attribute).toBe('attack');
      expect(suffix).toContain('Sangre de Orochi (+20)');
    });

    it('does NOT list AE that only touch physicalActions (Ceguera parcial via physical)', () => {
      const actor = mkActor([
        mkEffect('ceguera', 'Ceguera parcial', [
          { key: PHYSICAL_PATH, value: '-30', type: 'add' }
        ])
      ]);

      const { attribute, suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(attribute).toBe('attack');
      // physicalActions does not affect attack rolls.
      expect(suffix).toBe('');
    });

    it('combines multiple direct contributors', () => {
      const actor = mkActor([
        mkEffect('orochi', 'Sangre de Orochi', [
          { key: ATTACK_PATH, value: '20', type: 'add' }
        ]),
        mkEffect('berserker', 'Berserker', [
          { key: ATTACK_PATH, value: '10', type: 'add' }
        ])
      ]);

      const { suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(suffix).toContain('Sangre de Orochi (+20)');
      expect(suffix).toContain('Berserker (+10)');
    });

    it('ignores effects that target other attributes', () => {
      const actor = mkActor([
        mkEffect('dodgeBuff', 'Aquarius', [
          { key: DODGE_PATH, value: '15', type: 'add' }
        ])
      ]);

      const { suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(suffix).toBe('');
    });
  });

  describe('Parada y esquiva', () => {
    it('attributes a direct dodge buff under esquiva but not under parada', () => {
      const actor = mkActor([
        mkEffect('aquarius', 'Aquarius', [
          { key: DODGE_PATH, value: '15', type: 'add' }
        ])
      ]);
      expect(runFlavorPipeline(actor, 'Rolling esquiva').suffix).toContain('Aquarius (+15)');
      expect(runFlavorPipeline(actor, 'Rolling parada').suffix).toBe('');
    });

    it('does NOT list physicalActions-only AE under parada either', () => {
      const actor = mkActor([
        mkEffect('ceguera', 'Ceguera parcial', [
          { key: PHYSICAL_PATH, value: '-30', type: 'add' }
        ])
      ]);
      expect(runFlavorPipeline(actor, 'Rolling parada').suffix).toBe('');
    });

    it('lists a direct block AE under parada', () => {
      const actor = mkActor([
        mkEffect('orochi', 'Sangre de Orochi', [
          { key: BLOCK_PATH, value: '20', type: 'add' }
        ])
      ]);
      expect(runFlavorPipeline(actor, 'Rolling parada').suffix).toContain('Sangre de Orochi (+20)');
    });
  });

  describe('Iniciativa', () => {
    it('lists AE that touches initiative.final', () => {
      const actor = mkActor([
        mkEffect('derribado', 'Derribado', [
          { key: INITIATIVE_PATH, value: '-10', type: 'add' }
        ])
      ]);

      const { attribute, suffix } = runFlavorPipeline(actor, 'Iniciativa');
      expect(attribute).toBe('initiative');
      expect(suffix).toContain('Derribado (-10)');
    });
  });

  describe('Proyección mágica y psíquica', () => {
    it('catches an AE that buffs offensive magic projection', () => {
      const actor = mkActor([
        mkEffect('seraphite', 'Seraphite', [
          { key: MAGIC_OFFENSIVE_PATH, value: '30', type: 'add' }
        ])
      ]);

      const { attribute, suffix } = runFlavorPipeline(actor, 'Rolling proyección mágica ofensiva');
      expect(attribute).toBe('magicProjectionOffensive');
      expect(suffix).toContain('Seraphite (+30)');
    });

    it('catches an AE that buffs offensive psychic projection', () => {
      const actor = mkActor([
        mkEffect('shephon', 'Shephon', [
          { key: PSYCHIC_OFFENSIVE_PATH, value: '20', type: 'add' }
        ])
      ]);

      const { attribute, suffix } = runFlavorPipeline(actor, 'Rolling proyección psíquica ofensiva');
      expect(attribute).toBe('psychicProjectionOffensive');
      expect(suffix).toContain('Shephon (+20)');
    });
  });

  describe('Robustez del pipeline', () => {
    it('returns empty pipeline for unrecognized flavors', () => {
      const actor = mkActor([
        mkEffect('orochi', 'Sangre de Orochi', [{ key: ATTACK_PATH, value: '20', type: 'add' }])
      ]);
      const res = runFlavorPipeline(actor, 'Some random unrelated chat message');
      expect(res.attribute).toBeNull();
      expect(res.suffix).toBe('');
    });

    it('disabled AE are not listed', () => {
      const actor = mkActor([
        mkEffect('orochi', 'Sangre de Orochi',
          [{ key: ATTACK_PATH, value: '20', type: 'add' }],
          { active: false })
      ]);
      expect(runFlavorPipeline(actor, 'Rolling attack').suffix).toBe('');
    });

    it('override mode is rendered as non-linear (no signed delta)', () => {
      const actor = mkActor([
        mkEffect('shinkyou', 'Shinkyou (Posición Espejo)', [
          { key: ATTACK_PATH, value: '999', type: 'override' }
        ])
      ]);
      const { suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(suffix).toContain('Shinkyou (Posición Espejo) (override)');
      expect(suffix).toContain('Mod (no descompuesto)');
    });
  });

  describe('Una entrada por change (mismo AE, varios paths)', () => {
    it('lista por separado cada change de un mismo effect (sin agrupar)', () => {
      // Hypothetical AE that buffs attack from two direct paths simultaneously
      // (base + special). Each change is listed on its own — la separación es
      // intencional: gracias a esto detectamos rutas mal cableadas (p.ej. el
      // bug de physicalActions filtrándose a attack).
      const actor = mkActor([
        mkEffect('combo', 'Combo Buff', [
          { key: ATTACK_PATH, value: '20', type: 'add' },
          { key: 'system.combat.attack.special.value', value: '10', type: 'add' }
        ])
      ]);

      const { suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(suffix).toContain('Combo Buff (+20)');
      expect(suffix).toContain('Combo Buff (+10)');
      const occurrences = (suffix.match(/Combo Buff/g) ?? []).length;
      expect(occurrences).toBe(2);
    });

    it('mantiene effects distintos como entradas separadas', () => {
      const actor = mkActor([
        mkEffect('a', 'Orochi', [{ key: ATTACK_PATH, value: '20', type: 'add' }]),
        mkEffect('b', 'Berserker', [{ key: ATTACK_PATH, value: '10', type: 'add' }])
      ]);

      const { suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(suffix).toContain('Orochi (+20)');
      expect(suffix).toContain('Berserker (+10)');
    });
  });
});
;
      expect(suffix).toContain('Orochi (+20)');
      expect(suffix).toContain('Berserker (+10)');
    });
  });
});
