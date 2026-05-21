import { inferAttributeFromFlavor, ATTRIBUTE_DERIVATION_MAP } from './attributeDerivationMap.js';
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
 * If this suite passes the hook is guaranteed correct for the cases covered;
 * the only remaining unknown is the Foundry-side wiring (speaker -> actor
 * resolution), which is validated manually.
 */

const ATTACK_PATH = 'system.combat.attack.final.value';
const PHYSICAL_PATH = 'system.general.modifiers.physicalActions.final.value';
const ALL_ACTIONS_PATH = 'system.general.modifiers.allActions.final.value';
const BLOCK_PATH = 'system.combat.block.final.value';
const DODGE_PATH = 'system.combat.dodge.final.value';
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

/** End-to-end pipeline: same logic the hook runs. */
function runFlavorPipeline(actor, flavor) {
  const attribute = inferAttributeFromFlavor(flavor);
  if (!attribute) return { attribute: null, breakdown: null, suffix: '' };
  const breakdown = getActiveEffectsBreakdownForAttribute(actor, attribute);
  const suffix = formatAeBreakdownForFlavor(breakdown);
  return { attribute, breakdown, suffix };
}

describe('end-to-end flavor trace pipeline', () => {
  describe('Ataque', () => {
    it('attributes Sangre de Orochi (direct on attack.final) to ataque', () => {
      const actor = mkActor([
        mkEffect('orochi', 'Sangre de Orochi', [
          { key: ATTACK_PATH, value: '20', type: 'add' }
        ])
      ]);

      const { attribute, suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(attribute).toBe('attack');
      expect(suffix).toContain('Sangre de Orochi (+20)');
    });

    it('attributes Ceguera parcial (indirect via physicalActions) to ataque', () => {
      const actor = mkActor([
        mkEffect('ceguera', 'Ceguera parcial', [
          { key: PHYSICAL_PATH, value: '-30', type: 'add' }
        ])
      ]);

      const { attribute, suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(attribute).toBe('attack');
      expect(suffix).toContain('Ceguera parcial (-30)');
    });

    it('combines direct and indirect contributors under the same flavor', () => {
      const actor = mkActor([
        mkEffect('orochi', 'Sangre de Orochi', [
          { key: ATTACK_PATH, value: '20', type: 'add' }
        ]),
        mkEffect('berserker', 'Berserker', [
          { key: ATTACK_PATH, value: '10', type: 'add' }
        ]),
        mkEffect('ceguera', 'Ceguera parcial', [
          { key: PHYSICAL_PATH, value: '-30', type: 'add' }
        ])
      ]);

      const { suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(suffix).toContain('Sangre de Orochi (+20)');
      expect(suffix).toContain('Berserker (+10)');
      expect(suffix).toContain('Ceguera parcial (-30)');
    });

    it('catches the localized weapon-attack flavor', () => {
      const actor = mkActor([
        mkEffect('orochi', 'Sangre de Orochi', [
          { key: ATTACK_PATH, value: '20', type: 'add' }
        ])
      ]);

      const { attribute, suffix } = runFlavorPipeline(actor, 'Ataque físico con Hacha de guerra contra Goul');
      expect(attribute).toBe('attack');
      expect(suffix).toContain('Sangre de Orochi (+20)');
    });

    it('ignores effects on unrelated attributes (dodge buff doesn’t pollute ataque)', () => {
      const actor = mkActor([
        mkEffect('dodgeBuff', 'Aquarius', [
          { key: DODGE_PATH, value: '15', type: 'add' }
        ])
      ]);

      const { suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(suffix).toBe('');
    });

    it('catches the allActions modifier path too', () => {
      const actor = mkActor([
        mkEffect('allMod', 'Some global penalty', [
          { key: ALL_ACTIONS_PATH, value: '-20', type: 'add' }
        ])
      ]);

      const { suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(suffix).toContain('Some global penalty (-20)');
    });
  });

  describe('Parada y esquiva', () => {
    it('attributes Ceguera parcial to parada via the shared physicalActions modifier', () => {
      const actor = mkActor([
        mkEffect('ceguera', 'Ceguera parcial', [
          { key: PHYSICAL_PATH, value: '-30', type: 'add' }
        ])
      ]);

      const { attribute, suffix } = runFlavorPipeline(actor, 'Rolling parada');
      expect(attribute).toBe('block');
      expect(suffix).toContain('Ceguera parcial (-30)');
    });

    it('attributes Ceguera parcial to esquiva too', () => {
      const actor = mkActor([
        mkEffect('ceguera', 'Ceguera parcial', [
          { key: PHYSICAL_PATH, value: '-30', type: 'add' }
        ])
      ]);

      const { attribute, suffix } = runFlavorPipeline(actor, 'Rolling esquiva');
      expect(attribute).toBe('dodge');
      expect(suffix).toContain('Ceguera parcial (-30)');
    });

    it('a dodge-only buff appears under esquiva but not parada', () => {
      const actor = mkActor([
        mkEffect('aquarius', 'Aquarius', [
          { key: DODGE_PATH, value: '15', type: 'add' }
        ])
      ]);

      expect(runFlavorPipeline(actor, 'Rolling esquiva').suffix).toContain('Aquarius (+15)');
      expect(runFlavorPipeline(actor, 'Rolling parada').suffix).toBe('');
    });
  });

  describe('Iniciativa', () => {
    it('attributes Derribado (indirect — initiative penalty)', () => {
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
    it('catches the offensive magic projection flavor', () => {
      const actor = mkActor([
        mkEffect('seraphite', 'Seraphite', [
          { key: MAGIC_OFFENSIVE_PATH, value: '30', type: 'add' }
        ])
      ]);

      const { attribute, suffix } = runFlavorPipeline(actor, 'Rolling proyección mágica ofensiva');
      expect(attribute).toBe('magicProjectionOffensive');
      expect(suffix).toContain('Seraphite (+30)');
    });

    it('catches the offensive psychic projection flavor', () => {
      const actor = mkActor([
        mkEffect('shephon', 'Shephon', [
          { key: PSYCHIC_OFFENSIVE_PATH, value: '20', type: 'add' }
        ])
      ]);

      const { attribute, suffix } = runFlavorPipeline(actor, 'Rolling proyección psíquica ofensiva');
      expect(attribute).toBe('psychicProjectionOffensive');
      expect(suffix).toContain('Shephon (+20)');
    });

    it('does not cross-pollinate offensive and defensive projections', () => {
      const actor = mkActor([
        mkEffect('something', 'Defensive Buff', [
          { key: 'system.mystic.magicProjection.imbalance.defensive.final.value', value: '30', type: 'add' }
        ])
      ]);

      expect(runFlavorPipeline(actor, 'Rolling proyección mágica ofensiva').suffix).toBe('');
      expect(runFlavorPipeline(actor, 'Rolling proyección mágica defensiva').suffix).toContain('Defensive Buff (+30)');
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

    it('actor with no AE produces no suffix', () => {
      const actor = mkActor([]);
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

    it('multiply mode is rendered as non-linear (no signed delta)', () => {
      const actor = mkActor([
        mkEffect('doubler', 'Doubler', [
          { key: ATTACK_PATH, value: '2', type: 'multiply' }
        ])
      ]);
      const { suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(suffix).toContain('Doubler (multiply)');
    });

    it('Foundry-standard numeric mode 2 (ADD) is treated as linear add', () => {
      const actor = mkActor([
        mkEffect('eff', 'Native AE', [
          { key: ATTACK_PATH, value: '15', mode: 2 }
        ])
      ]);
      const { suffix } = runFlavorPipeline(actor, 'Rolling attack');
      expect(suffix).toContain('Native AE (+15)');
    });

    it('keeps the order in which effects appear on the actor', () => {
      const actor = mkActor([
        mkEffect('a', 'A', [{ key: ATTACK_PATH, value: '5', type: 'add' }]),
        mkEffect('b', 'B', [{ key: ATTACK_PATH, value: '5', type: 'add' }]),
        mkEffect('c', 'C', [{ key: ATTACK_PATH, value: '5', type: 'add' }])
      ]);
      const { suffix } = runFlavorPipeline(actor, 'Rolling attack');
      const order = suffix.indexOf('A (') < suffix.indexOf('B (') &&
                    suffix.indexOf('B (') < suffix.indexOf('C (');
      expect(order).toBe(true);
    });

    it('Sigrid scenario: Orochi + Berserker + Ceguera parcial all listed under attack', () => {
      const actor = mkActor([
        mkEffect('orochi', 'Sangre de Orochi - Sangre de la Violencia', [
          { key: ATTACK_PATH, value: '20', type: 'add' }
        ]),
        mkEffect('berserker', 'Berserker', [
          { key: ATTACK_PATH, value: '10', type: 'add' }
        ]),
        mkEffect('ceguera', 'Ceguera parcial', [
          { key: PHYSICAL_PATH, value: '-30', type: 'add' }
        ])
      ]);

      const { suffix, breakdown } = runFlavorPipeline(actor, 'Rolling attack');
      expect(breakdown.items).toHaveLength(3);
      expect(breakdown.linearTotal).toBe(0); // 20 + 10 - 30 = 0
      expect(suffix).toContain('Sangre de Orochi');
      expect(suffix).toContain('Berserker');
      expect(suffix).toContain('Ceguera parcial');
    });
  });

  describe('Integrity of ATTRIBUTE_DERIVATION_MAP', () => {
    it('every attribute lists its own final path first', () => {
      for (const [attr, paths] of Object.entries(ATTRIBUTE_DERIVATION_MAP)) {
        expect(paths.length).toBeGreaterThan(0);
        expect(paths[0]).toMatch(/\.final\.value$/);
      }
    });

    it('attack, block and dodge share the same modifier set', () => {
      const sharedMods = [
        'system.general.modifiers.allActions.final.value',
        'system.general.modifiers.physicalActions.final.value'
      ];
      for (const mod of sharedMods) {
        expect(ATTRIBUTE_DERIVATION_MAP.attack).toContain(mod);
        expect(ATTRIBUTE_DERIVATION_MAP.block).toContain(mod);
        expect(ATTRIBUTE_DERIVATION_MAP.dodge).toContain(mod);
      }
    });
  });
});
