export class FormulaIfComparisonEvaluator {
  /**
   * Evaluate an if-condition expression (comparators and logical operators).
   *
   * @param {string} conditionExpr
   * @param {(expr: string) => string} [resolveFunctions]
   * @returns {number}
   */
  static evaluateCondition(conditionExpr, resolveFunctions) {
    const trimmed = (conditionExpr ?? '').trim();
    if (!trimmed) return 0;

    let normalized = this.#normalizeBooleanLiterals(trimmed);

    if (typeof resolveFunctions === 'function') {
      normalized = resolveFunctions(normalized);
    }

    try {
      const result = Roll.safeEval(normalized);
      const num = Number(result);
      return Number.isFinite(num) ? num : 0;
    } catch (err) {
      console.error('FormulaIfComparisonEvaluator: condition eval error:', {
        conditionExpr,
        normalized,
        err
      });
      throw err;
    }
  }

  static #normalizeBooleanLiterals(expr) {
    return expr.replace(/\b(true|false)\b/gi, literal => {
      return literal.toLowerCase() === 'true' ? '1' : '0';
    });
  }
}
