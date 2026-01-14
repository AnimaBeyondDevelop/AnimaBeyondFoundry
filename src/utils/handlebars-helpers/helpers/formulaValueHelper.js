import { FormulaEvaluator } from '../../formulaEvaluator.js';

export const formulaValueHelper = {
  name: 'formulaValue',
  fn: function (formula, actor) {
    if (!formula || !actor) return 0;

    try {
      const value = FormulaEvaluator.evaluate(String(formula), actor);
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    } catch (e) {
      console.warn('[ABF] formulaValue helper error:', formula, e);
      return 0;
    }
  }
};
