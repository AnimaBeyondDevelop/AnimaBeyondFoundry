import {
  getActiveEffectsBreakdownForPath,
  getActiveEffectsBreakdownForPaths,
  getActiveEffectsBreakdownForAttribute
} from './activeEffectsBreakdown.js';

const makeActor = ({ sourceAttack = 100, currentAttack = 100, effects = [] } = {}) => ({
  _source: {
    system: {
      combat: { attack: { final: { value: sourceAttack } } }
    }
  },
  system: {
    combat: { attack: { final: { value: currentAttack } } }
  },
  effects: { contents: effects }
});

const ATTACK_PATH = 'system.combat.attack.final.value';
const PHYSICAL_PATH = 'system.general.modifiers.physicalActions.final.value';

describe('getActiveEffectsBreakdownForPath (single-path legacy API)', () => {
  it('lists a single matching effect', () => {
    const actor = makeActor({
      sourceAttack: 100, currentAttack: 120,
      effects: [{
        id: 'eff1', name: 'Sangre de Orochi', active: true,
        changes: [{ key: ATTACK_PATH, value: '20', type: 'add' }]
      }]
    });

    const res = getActiveEffectsBreakdownForPath(actor, ATTACK_PATH);
    expect(res.items).toHaveLength(1);
    expect(res.items[0].effectName).toBe('Sangre de Orochi');
    expect(res.total).toBe(20);
  });

  it('returns total based on source-diff (defensive)', () => {
    // current=95 source=100, but Orochi alone says +20. Diff = -5.
    const actor = makeActor({
      sourceAttack: 100, currentAttack: 95,
      effects: [{
        id: 'eff1', name: 'X', active: true,
        changes: [{ key: ATTACK_PATH, value: '20', type: 'add' }]
      }]
    });

    const res = getActiveEffectsBreakdownForPath(actor, ATTACK_PATH);
    expect(res.total).toBe(-5);          // source diff
    expect(res.linearTotal).toBe(20);    // items sum
  });
});

describe('getActiveEffectsBreakdownForPaths (multi-path)', () => {
  it('collects effects targeting any of the provided paths', () => {
    const actor = makeActor({
      effects: [
        {
          id: 'orochi', name: 'Sangre de Orochi', active: true,
          changes: [{ key: ATTACK_PATH, value: '20', type: 'add' }]
        },
        {
          id: 'ceguera', name: 'Ceguera parcial', active: true,
          changes: [{ key: PHYSICAL_PATH, value: '-30', type: 'add' }]
        }
      ]
    });

    const res = getActiveEffectsBreakdownForPaths(actor, [ATTACK_PATH, PHYSICAL_PATH]);

    expect(res.items).toHaveLength(2);
    expect(res.items.map(i => i.effectName)).toEqual(['Sangre de Orochi', 'Ceguera parcial']);
    expect(res.linearTotal).toBe(-10);
  });

  it('ignores effects that target unrelated paths', () => {
    const actor = makeActor({
      effects: [{
        id: 'dodge', name: 'Some Dodge Buff', active: true,
        changes: [{ key: 'system.combat.dodge.final.value', value: '15', type: 'add' }]
      }]
    });

    const res = getActiveEffectsBreakdownForPaths(actor, [ATTACK_PATH, PHYSICAL_PATH]);
    expect(res.items).toEqual([]);
  });
});

describe('getActiveEffectsBreakdownForAttribute (resolves derivation map)', () => {
  it('attributes Ceguera (vía physicalActions) to the attack attribute', () => {
    const actor = makeActor({
      effects: [{
        id: 'ceguera', name: 'Ceguera parcial', active: true,
        changes: [{ key: PHYSICAL_PATH, value: '-30', type: 'add' }]
      }]
    });

    const res = getActiveEffectsBreakdownForAttribute(actor, 'attack');
    expect(res.items).toHaveLength(1);
    expect(res.items[0].effectName).toBe('Ceguera parcial');
    expect(res.items[0].path).toBe(PHYSICAL_PATH);
    expect(res.linearTotal).toBe(-30);
  });

  it('groups direct and indirect contributors under the same attribute', () => {
    const actor = makeActor({
      effects: [
        {
          id: 'orochi', name: 'Sangre de Orochi', active: true,
          changes: [{ key: ATTACK_PATH, value: '20', type: 'add' }]
        },
        {
          id: 'ceguera', name: 'Ceguera parcial', active: true,
          changes: [{ key: PHYSICAL_PATH, value: '-30', type: 'add' }]
        }
      ]
    });

    const res = getActiveEffectsBreakdownForAttribute(actor, 'attack');
    expect(res.items).toHaveLength(2);
    expect(res.linearTotal).toBe(-10);
  });

  it('returns empty for unknown attribute', () => {
    const actor = makeActor();
    const res = getActiveEffectsBreakdownForAttribute(actor, 'nopeNope');
    expect(res.items).toEqual([]);
  });
});
