import { getActiveEffectsBreakdownForPath } from './activeEffectsBreakdown.js';

/**
 * Build a minimal actor stub:
 *  - `_source.system` holds the pre-AE value (what the GM has in the sheet).
 *  - `system` holds the post-AE value (what would be read after the flow).
 *  - `effects.contents` is an array of effect stubs with `active` and
 *    `changes` exactly as a Foundry ActiveEffect would expose them.
 */
const makeActor = ({ sourceAttack, currentAttack, effects }) => ({
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

describe('getActiveEffectsBreakdownForPath', () => {
  it('returns an empty breakdown when no effects target the path', () => {
    const actor = makeActor({
      sourceAttack: 100,
      currentAttack: 100,
      effects: []
    });

    const res = getActiveEffectsBreakdownForPath(actor, ATTACK_PATH);

    expect(res.total).toBe(0);
    expect(res.linearTotal).toBe(0);
    expect(res.hasNonLinear).toBe(false);
    expect(res.items).toEqual([]);
  });

  it('lists a single add effect with its name and value', () => {
    const actor = makeActor({
      sourceAttack: 100,
      currentAttack: 120,
      effects: [
        {
          id: 'eff1',
          name: 'Sangre de Orochi',
          active: true,
          changes: [{ key: ATTACK_PATH, value: '20', type: 'add' }]
        }
      ]
    });

    const res = getActiveEffectsBreakdownForPath(actor, ATTACK_PATH);

    expect(res.total).toBe(20);
    expect(res.linearTotal).toBe(20);
    expect(res.hasNonLinear).toBe(false);
    expect(res.items).toHaveLength(1);
    expect(res.items[0]).toMatchObject({
      effectName: 'Sangre de Orochi',
      mode: 'add',
      value: 20,
      isLinear: true
    });
  });

  it('skips effects that are not active', () => {
    const actor = makeActor({
      sourceAttack: 100,
      currentAttack: 100,
      effects: [
        {
          id: 'eff1',
          name: 'Sangre de Orochi',
          active: false,
          changes: [{ key: ATTACK_PATH, value: '20', type: 'add' }]
        }
      ]
    });

    const res = getActiveEffectsBreakdownForPath(actor, ATTACK_PATH);

    expect(res.total).toBe(0);
    expect(res.items).toEqual([]);
  });

  it('skips changes that target a different path', () => {
    const actor = makeActor({
      sourceAttack: 100,
      currentAttack: 100,
      effects: [
        {
          id: 'eff1',
          name: 'Some Block Buff',
          active: true,
          changes: [{ key: 'system.combat.block.final.value', value: '20', type: 'add' }]
        }
      ]
    });

    const res = getActiveEffectsBreakdownForPath(actor, ATTACK_PATH);

    expect(res.total).toBe(0);
    expect(res.items).toEqual([]);
  });

  it('sums multiple linear adds and lists them individually', () => {
    const actor = makeActor({
      sourceAttack: 100,
      currentAttack: 90, // +20 -30 = -10 net
      effects: [
        {
          id: 'eff1',
          name: 'Sangre de Orochi',
          active: true,
          changes: [{ key: ATTACK_PATH, value: '20', type: 'add' }]
        },
        {
          id: 'eff2',
          name: 'Ceguera parcial',
          active: true,
          changes: [{ key: ATTACK_PATH, value: '-30', type: 'add' }]
        }
      ]
    });

    const res = getActiveEffectsBreakdownForPath(actor, ATTACK_PATH);

    expect(res.total).toBe(-10);
    expect(res.linearTotal).toBe(-10);
    expect(res.hasNonLinear).toBe(false);
    expect(res.items).toHaveLength(2);
    expect(res.items.map(i => i.effectName)).toEqual(['Sangre de Orochi', 'Ceguera parcial']);
  });

  it('marks override effects as non-linear and does not include them in linearTotal', () => {
    const actor = makeActor({
      sourceAttack: 100,
      currentAttack: 999,
      effects: [
        {
          id: 'eff1',
          name: 'Override Test',
          active: true,
          changes: [{ key: ATTACK_PATH, value: '999', type: 'override' }]
        }
      ]
    });

    const res = getActiveEffectsBreakdownForPath(actor, ATTACK_PATH);

    expect(res.total).toBe(899); // current - source
    expect(res.linearTotal).toBe(0);
    expect(res.hasNonLinear).toBe(true);
    expect(res.items[0].isLinear).toBe(false);
    expect(res.items[0].mode).toBe('override');
  });

  it('handles Foundry-standard numeric mode (mode: 2 = ADD)', () => {
    const actor = makeActor({
      sourceAttack: 100,
      currentAttack: 115,
      effects: [
        {
          id: 'eff1',
          name: 'Native AE',
          active: true,
          changes: [{ key: ATTACK_PATH, value: '15', mode: 2 }]
        }
      ]
    });

    const res = getActiveEffectsBreakdownForPath(actor, ATTACK_PATH);

    expect(res.total).toBe(15);
    expect(res.items[0].isLinear).toBe(true);
    expect(res.items[0].mode).toBe('add');
  });

  it('total reflects the actor diff even if items disagree (defensive)', () => {
    // Edge case: items report +20 but the actor diff says -5. This can
    // happen if some other code path also writes to the field, or if the
    // AE flow has not run yet. We trust the actor diff as the authoritative
    // total; items remain for nominal display.
    const actor = makeActor({
      sourceAttack: 100,
      currentAttack: 95,
      effects: [
        {
          id: 'eff1',
          name: 'Listed',
          active: true,
          changes: [{ key: ATTACK_PATH, value: '20', type: 'add' }]
        }
      ]
    });

    const res = getActiveEffectsBreakdownForPath(actor, ATTACK_PATH);

    expect(res.total).toBe(-5);          // actor diff
    expect(res.linearTotal).toBe(20);    // sum of listed items
  });
});
