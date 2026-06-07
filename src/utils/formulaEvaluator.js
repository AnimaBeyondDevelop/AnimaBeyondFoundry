// utils/formulaEvaluator.js
import { calculateAttributeModifier } from '../module/actor/utils/prepareActor/calculations/util/calculateAttributeModifier.js';
import { FormulaIfComparisonEvaluator } from './formulaIfComparisonEvaluator.js';

export class FormulaEvaluator {
  // Temporary actor context while evaluating a formula.
  static #currentEvaluatingActor = null;

  static FUNCTIONS = {
    floor: x => Math.floor(x),
    ceil: x => Math.ceil(x),
    round: x => Math.round(x),
    abs: x => Math.abs(x),
    min: (...xs) => Math.min(...xs),
    max: (...xs) => Math.max(...xs),
    clamp: (v, min, max) => Math.min(Math.max(v, min), max),

    statMod: x => calculateAttributeModifier(x),

    // currentRound() reads the actor currently being evaluated.
    currentRound: () => {
      const actor = FormulaEvaluator.#currentEvaluatingActor;
      if (!actor) return 0;

      // Preferred Foundry path: actor -> combatant -> combat -> round
      const roundFromCombatant = Number(actor.combatant?.combat?.round);
      if (Number.isFinite(roundFromCombatant)) return roundFromCombatant;

      // Fallback used by some mocks/legacy data
      const roundFromActor = Number(actor.combat?.round);
      if (Number.isFinite(roundFromActor)) return roundFromActor;

      // Extra fallback: resolve from active combat by actor id when combatant is not attached
      const actorId = actor.id ?? actor._id;
      const activeCombat = globalThis.game?.combat;
      const combatant = activeCombat?.combatants?.find?.(
        c => c?.actorId === actorId || c?.actor?.id === actorId
      );
      if (combatant) return Number(activeCombat?.round) || 0;

      return 0;
    }
  };

  /**
   * Eval numeric formula using actor data paths + whitelisted functions.
   * Supports:
   *  - @paths like @characteristics.primaries.power.mod
   *  - functions like floor(...), ceil(...), clamp(...), currentRound(), etc.
   * No dice allowed here.
   *
   * @param {string} formula
   * @param {Actor|null} actor
   * @returns {number|null}
   */
  static evaluate(formula, actor = null) {
    const clean = (formula ?? '').trim();
    if (!clean) return null;

    // No dice inside @formula for now
    if (/[dD]\d+/.test(clean)) {
      console.warn('FormulaEvaluator: dice are not allowed inside @formula:', clean);
      return null;
    }

    this.#currentEvaluatingActor = actor;

    try {
      const normalized = this.#normalizeBooleanLiterals(clean);

      /** @type {any} */
      const ctx = actor?.system ? foundry.utils.duplicate(actor.system) : {};
      // Allow both @foo.bar and @system.foo.bar
      ctx.system = ctx;

      const withValues = normalized.replace(/@([a-zA-Z0-9_.]+)/g, (_match, path) => {
        let value = foundry.utils.getProperty(ctx, path);

        // Convenience for fields shaped as { value: X }
        if (value && typeof value === 'object' && 'value' in value) {
          value = value.value;
        }

        const num = Number(value);
        return Number.isFinite(num) ? String(num) : '0';
      });

      const withConditionals = this.#resolveConditionals(withValues);
      const resolved = this.#resolveFunctions(withConditionals);

      const compact = resolved.replace(/\s+/g, '');
      if (!/^[0-9+\-*/().,]*$/.test(compact)) {
        console.error('FormulaEvaluator: invalid chars after replace/resolve', {
          original: clean,
          normalized,
          withValues,
          withConditionals,
          resolved
        });
        return null;
      }

      const total = Roll.safeEval(resolved);
      return Number.isFinite(total) ? total : null;
    } catch (err) {
      console.error('FormulaEvaluator error evaluating formula:', {
        formula: clean,
        err
      });
      return null;
    } finally {
      this.#currentEvaluatingActor = null;
    }
  }

  /**
   * Resolve if(condition, trueVal, falseVal) lazily (Excel style).
   */
  static #resolveConditionals(expr) {
    let current = expr;

    for (let i = 0; i < 50; i++) {
      const found = this.#findNextConditional(current);
      if (!found) break;

      const { startIndex, closeParenIndex, args } = found;
      const [conditionExpr, trueVal, falseVal] = args;

      const condEval = FormulaIfComparisonEvaluator.evaluateCondition(
        conditionExpr,
        nested => this.#resolveFunctions(nested)
      );
      const isTruthy = condEval !== 0 && condEval !== false;

      const selectedVal = isTruthy ? this.#evalArg(trueVal) : this.#evalArg(falseVal);

      current =
        current.slice(0, startIndex) +
        String(selectedVal) +
        current.slice(closeParenIndex + 1);
    }

    return current;
  }

  static #findNextConditional(s) {
    const re = /\bif\s*\(/g;
    const match = re.exec(s);
    if (!match) return null;

    const startIndex = match.index;
    const openParenIndex = re.lastIndex - 1;
    const closeParenIndex = this.#findMatchingParen(s, openParenIndex);

    if (closeParenIndex < 0) {
      console.error('FormulaEvaluator: unbalanced parentheses in:', s);
      throw new Error('Unbalanced parentheses');
    }

    const inside = s.slice(openParenIndex + 1, closeParenIndex);
    const args = this.#splitArgs(inside);

    if (args.length !== 3) {
      throw new Error(`if() requires 3 arguments, got ${args.length}`);
    }

    return { startIndex, openParenIndex, closeParenIndex, args };
  }

  static #resolveFunctions(expr) {
    let current = expr;

    for (let i = 0; i < 50; i++) {
      const found = this.#findNextFunctionCall(current);
      if (!found) break;

      const { name, startIndex, openParenIndex, closeParenIndex } = found;
      const fn = this.FUNCTIONS[name];
      if (!fn) {
        throw new Error(`Function not allowed: ${name}`);
      }

      const inside = current.slice(openParenIndex + 1, closeParenIndex);
      const args = this.#splitArgs(inside).map(arg => this.#evalArg(arg));

      const result = fn(...args);
      const num = Number(result);
      if (!Number.isFinite(num)) {
        throw new Error(`Function returned non-finite: ${name}`);
      }

      current =
        current.slice(0, startIndex) +
        String(num) +
        current.slice(closeParenIndex + 1);
    }

    return current;
  }

  static #evalArg(argExpr) {
    const trimmed = (argExpr ?? '').trim();
    if (!trimmed) return 0;

    const normalized = this.#normalizeBooleanLiterals(trimmed);
    const withConditionals = this.#resolveConditionals(normalized);
    const resolved = this.#resolveFunctions(withConditionals);

    const compact = resolved.replace(/\s+/g, '');
    if (!/^[0-9+\-*/().,]*$/.test(compact)) {
      throw new Error('Invalid chars in function arg');
    }

    const value = Roll.safeEval(resolved);
    const num = Number(value);
    if (!Number.isFinite(num)) {
      throw new Error('Arg eval not finite');
    }

    return num;
  }

  static #splitArgs(s) {
    const args = [];
    let depth = 0;
    let last = 0;

    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth = Math.max(0, depth - 1);
      else if (ch === ',' && depth === 0) {
        args.push(s.slice(last, i));
        last = i + 1;
      }
    }

    args.push(s.slice(last));
    return args.map(x => x.trim()).filter(x => x.length > 0);
  }

  static #findNextFunctionCall(s) {
    const re = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    const match = re.exec(s);
    if (!match) return null;

    const name = match[1];
    const startIndex = match.index;
    const openParenIndex = re.lastIndex - 1;
    const closeParenIndex = this.#findMatchingParen(s, openParenIndex);

    if (closeParenIndex < 0) {
      throw new Error('Unbalanced parentheses');
    }

    return { name, startIndex, openParenIndex, closeParenIndex };
  }

  static #findMatchingParen(s, openIndex) {
    let depth = 0;
    for (let i = openIndex; i < s.length; i++) {
      const ch = s[i];
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  static #normalizeBooleanLiterals(expr) {
    return String(expr).replace(/\b(true|false)\b/gi, literal =>
      literal.toLowerCase() === 'true' ? '1' : '0'
    );
  }

  /**
   * Extract @path dependencies from a formula.
   * Returns normalized paths prefixed with "system." (unless already "system.").
   *
   * @param {string} formula
   * @returns {string[]}
   */
  static getDependencies(formula) {
    const clean = (formula ?? '').trim();
    if (!clean) return [];

    const deps = new Set();
    const re = /@([a-zA-Z0-9_.]+)/g;
    let m;

    while ((m = re.exec(clean)) !== null) {
      const raw = String(m[1] ?? '').trim();
      if (!raw) continue;

      const normalized = raw.startsWith('system.') ? raw : `system.${raw}`;
      deps.add(normalized);
    }

    return [...deps];
  }
}
