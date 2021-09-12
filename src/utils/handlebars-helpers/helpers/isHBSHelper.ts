/* eslint-disable eqeqeq */
import { HandlebarsHelper } from '../registerHelpers';

export const isHBSHelper: HandlebarsHelper<void> = {
  name: 'is',
  fn: (op: unknown, val1: string | number, val2: string | number, options: { fn; inverse }) => {
    const getTruthyFn = () => {
      return options.fn?.(this) ?? true;
    };

    const getFalsyFn = () => {
      return options.inverse?.(this) ?? false;
    };

    if (op === 'neq') {
      return val1 != val2 ? getTruthyFn() : getFalsyFn();
    }

    if (op === 'eq') {
      return val1 == val2 ? getTruthyFn() : getFalsyFn();
    }

    if (op === 'gt') {
      return val1 > val2 ? getTruthyFn() : getFalsyFn();
    }

    if (op === 'gte') {
      return val1 >= val2 ? getTruthyFn() : getFalsyFn();
    }

    if (op === 'lt') {
      return val1 < val2 ? getTruthyFn() : getFalsyFn();
    }

    if (op === 'lte') {
      return val1 <= val2 ? getTruthyFn() : getFalsyFn();
    }

    throw new Error(`Unknown operator (${op})`);
  }
};
