import { FormulaEvaluator } from '../src/utils/formulaEvaluator.js';
import { describe, it, expect, beforeAll } from 'vitest';

describe('FormulaEvaluator conditionals', () => {
  beforeAll(() => {
    globalThis.foundry = {
      utils: {
        duplicate: data => JSON.parse(JSON.stringify(data ?? {})),
        getProperty: (obj, path) => {
          if (!path) return undefined;
          return String(path)
            .split('.')
            .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
        }
      }
    };

    globalThis.Roll = {
      safeEval: expr => Function(`"use strict"; return (${expr});`)()
    };
  });

  it('evaluates if with comparison operators', () => {
    expect(FormulaEvaluator.evaluate('if(5 > 3, 10, 20)')).toBe(10);
    expect(FormulaEvaluator.evaluate('if(5 <= 3, 10, 20)')).toBe(20);
  });

  it('supports logical operators in condition', () => {
    const result = FormulaEvaluator.evaluate('if((5 > 3 && 2 < 1) || 4 == 4, 7, 9)');
    expect(result).toBe(7);
  });

  it('supports nested if with if(cond, trueVal, falseVal) format', () => {
    expect(FormulaEvaluator.evaluate('if(1 == 2, 5, 8)')).toBe(8);
    expect(FormulaEvaluator.evaluate('if(1 > 2, 10, if(3 >= 3, 30, 40))')).toBe(30);
  });

  it('returns null for removed else/elseIf helpers', () => {
    expect(FormulaEvaluator.evaluate('if(1 == 2, 5, else(8))')).toBeNull();
    expect(FormulaEvaluator.evaluate('elseIf(2 != 1, 11, 12)')).toBeNull();
  });

  it('accepts boolean literals true/false in conditions and branches', () => {
    expect(FormulaEvaluator.evaluate('if(true, 10, 20)')).toBe(10);
    expect(FormulaEvaluator.evaluate('if(false, 10, 20)')).toBe(20);
    expect(FormulaEvaluator.evaluate('if(1 == 1, false, true)')).toBe(0);
    expect(FormulaEvaluator.evaluate('if(1 == 0, false, true)')).toBe(1);
  });

  it('accepts boolean literals regardless of casing', () => {
    expect(FormulaEvaluator.evaluate('if(TRUE, 10, 20)')).toBe(10);
    expect(FormulaEvaluator.evaluate('if(False, 10, 20)')).toBe(20);
    expect(FormulaEvaluator.evaluate('if(TrUe && !FaLsE, 3, 4)')).toBe(3);
    expect(FormulaEvaluator.evaluate('if(1 == 1, FaLsE, TrUe)')).toBe(0);
  });

  it('supports @paths in conditional expressions', () => {
    const actor = {
      system: {
        a: { value: 5 },
        b: 3
      }
    };
    const result = FormulaEvaluator.evaluate('if(@a > 3 && @b != 4, 1, 0)', actor);
    expect(result).toBe(1);
  });

  it('evaluates only selected branch in if', () => {
    const result = FormulaEvaluator.evaluate('if(1 == 1, 42, badFn(1))');
    expect(result).toBe(42);

    const invalidBranchResult = FormulaEvaluator.evaluate('if(1 == 0, 42, badFn(1))');
    expect(invalidBranchResult).toBeNull();
  });

  it('currentRound() returns actor combat round or 0 if not in combat', () => {
    // Actor without combat
    const actorNoCombat = {
      system: {},
      combat: null
    };
    expect(FormulaEvaluator.evaluate('currentRound()', actorNoCombat)).toBe(0);

    // Actor with combat at round 3
    const actorInCombat = {
      system: {},
      combat: {
        round: 3
      }
    };
    expect(FormulaEvaluator.evaluate('currentRound()', actorInCombat)).toBe(3);

    // Actor with combat at round 1
    const actorNewCombat = {
      system: {},
      combat: {
        round: 1
      }
    };
    expect(FormulaEvaluator.evaluate('currentRound()', actorNewCombat)).toBe(1);

    // No actor at all
    expect(FormulaEvaluator.evaluate('currentRound()', null)).toBe(0);
  });

  it('currentRound() can be used in expressions', () => {
    const actor = {
      system: {},
      combat: { round: 5 }
    };
    expect(FormulaEvaluator.evaluate('currentRound() * 2', actor)).toBe(10);
    expect(FormulaEvaluator.evaluate('currentRound() + 3', actor)).toBe(8);
    expect(FormulaEvaluator.evaluate('if(currentRound() > 3, 100, 50)', actor)).toBe(100);
  });
});
