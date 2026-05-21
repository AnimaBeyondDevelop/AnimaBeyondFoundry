import {
  buildActiveEffectChangeOp,
  buildActiveEffectChangeOps
} from './buildActiveEffectOps.js';
import { applySingleActiveEffectChange } from '../../applicators/activeEffectApplicator.js';

/**
 * Regression tests for the bug where Active Effects items were not being
 * applied to the actor during prepareActor's effect flow.
 *
 * Two root causes were identified:
 *  1. buildActiveEffectChangeOps read `effect.system.changes` instead of the
 *     Foundry-standard `effect.changes` top-level property, so the loop never
 *     iterated and zero ops were produced.
 *  2. The applicator/builder only matched the legacy custom string mode (e.g.
 *     `change.type === 'add'`) and missed the Foundry-standard numeric
 *     `change.mode` (CONST.ACTIVE_EFFECT_MODES.ADD = 2). Any AE created
 *     through Foundry's standard schema validation lost its mode and
 *     defaulted to the no-op branch.
 *
 * Both layers are exercised here so the contract stays honest going forward.
 */

const mkEffect = (id, changes, { active = true } = {}) => ({
  id,
  active,
  priority: 0,
  changes,
  // legacy nested data the OLD builder used to look at — kept null to prove
  // the new builder no longer relies on it
  system: {}
});

describe('buildActiveEffectChangeOps', () => {
  it('reads changes from effect.changes (top-level), not effect.system.changes', () => {
    const effect = mkEffect('eff1', [
      { key: 'system.combat.attack.final.value', value: '20', type: 'add', priority: null }
    ]);

    const actor = { effects: { contents: [effect] } };

    const ops = buildActiveEffectChangeOps(actor);

    expect(ops).toHaveLength(1);
    expect(ops[0].id).toBe('ae:eff1:0');
    expect(ops[0].writes[0].path).toBe('system.combat.attack.final.value');
  });

  it('skips effects that are not active', () => {
    const effect = mkEffect(
      'eff2',
      [{ key: 'system.combat.attack.final.value', value: '20', type: 'add' }],
      { active: false }
    );

    const actor = { effects: { contents: [effect] } };

    expect(buildActiveEffectChangeOps(actor)).toHaveLength(0);
  });

  it('emits one op per change', () => {
    const effect = mkEffect('eff3', [
      { key: 'system.combat.attack.final.value', value: '10', type: 'add' },
      { key: 'system.combat.block.final.value', value: '10', type: 'add' },
      { key: 'system.combat.dodge.final.value', value: '-30', type: 'add' }
    ]);

    const actor = { effects: { contents: [effect] } };

    const ops = buildActiveEffectChangeOps(actor);
    expect(ops).toHaveLength(3);
  });
});

describe('applySingleActiveEffectChange', () => {
  /**
   * Minimal actor stub: a plain object with a `system` tree we can read/write
   * with foundry.utils.setProperty/getProperty equivalents (the applicator
   * uses foundry.utils directly — for this test we shim a tiny global).
   */
  const setupGlobalFoundryUtils = () => {
    const getProperty = (obj, path) =>
      path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

    const setProperty = (obj, path, value) => {
      const keys = path.split('.');
      let cur = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {};
        cur = cur[k];
      }
      cur[keys[keys.length - 1]] = value;
      return true;
    };

    globalThis.foundry = {
      ...(globalThis.foundry ?? {}),
      utils: { ...(globalThis.foundry?.utils ?? {}), getProperty, setProperty }
    };
  };

  beforeAll(setupGlobalFoundryUtils);

  it('adds with legacy string mode (type: "add")', () => {
    const actor = {
      system: { combat: { attack: { final: { value: 50 } } } },
      _applyDynamicEffectValue: v => v
    };

    applySingleActiveEffectChange(actor, {}, {
      key: 'system.combat.attack.final.value',
      type: 'add',
      value: '20'
    });

    expect(actor.system.combat.attack.final.value).toBe(70);
  });

  it('adds with Foundry-standard numeric mode (CONST.ACTIVE_EFFECT_MODES.ADD = 2)', () => {
    const actor = {
      system: { combat: { attack: { final: { value: 50 } } } },
      _applyDynamicEffectValue: v => v
    };

    applySingleActiveEffectChange(actor, {}, {
      key: 'system.combat.attack.final.value',
      mode: 2, // CONST.ACTIVE_EFFECT_MODES.ADD
      value: '20'
    });

    expect(actor.system.combat.attack.final.value).toBe(70);
  });

  it('multiplies with Foundry-standard numeric mode (MULTIPLY = 1)', () => {
    const actor = {
      system: { combat: { attack: { final: { value: 10 } } } },
      _applyDynamicEffectValue: v => v
    };

    applySingleActiveEffectChange(actor, {}, {
      key: 'system.combat.attack.final.value',
      mode: 1, // CONST.ACTIVE_EFFECT_MODES.MULTIPLY
      value: '3'
    });

    expect(actor.system.combat.attack.final.value).toBe(30);
  });

  it('overrides with Foundry-standard numeric mode (OVERRIDE = 5)', () => {
    const actor = {
      system: { combat: { attack: { final: { value: 50 } } } },
      _applyDynamicEffectValue: v => v
    };

    applySingleActiveEffectChange(actor, {}, {
      key: 'system.combat.attack.final.value',
      mode: 5, // CONST.ACTIVE_EFFECT_MODES.OVERRIDE
      value: '99'
    });

    expect(actor.system.combat.attack.final.value).toBe(99);
  });
});

describe('buildActiveEffectChangeOp writeKind', () => {
  it('maps the legacy "override" string to overwrite', () => {
    const op = buildActiveEffectChangeOp({ id: 'x', priority: 0 }, 0, {
      key: 'system.combat.attack.final.value',
      type: 'override',
      value: '99'
    });
    expect(op.writes[0].kind).toBe('overwrite');
  });

  it('maps the Foundry-standard OVERRIDE numeric mode (5) to overwrite', () => {
    const op = buildActiveEffectChangeOp({ id: 'x', priority: 0 }, 0, {
      key: 'system.combat.attack.final.value',
      mode: 5,
      value: '99'
    });
    expect(op.writes[0].kind).toBe('overwrite');
  });

  it('maps any other mode to modify', () => {
    const op = buildActiveEffectChangeOp({ id: 'x', priority: 0 }, 0, {
      key: 'system.combat.attack.final.value',
      mode: 2,
      value: '20'
    });
    expect(op.writes[0].kind).toBe('modify');
  });
});
