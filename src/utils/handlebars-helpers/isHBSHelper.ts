import { HandlebarsHelper } from './registerHelpers';

export const isHBSHelper: HandlebarsHelper<void> = {
  name: 'is',
  fn: (
    op: unknown,
    val1: string | number,
    val2: string | number,
    options: { fn; inverse }
  ) => {
    if (op === 'eq') {
      return val1 === val2 ? options.fn(this) : options.inverse(this);
    }

    if (op === 'gt') {
      return val1 > val2 ? options.fn(this) : options.inverse(this);
    }

    if (op === 'gte') {
      return val1 >= val2 ? options.fn(this) : options.inverse(this);
    }

    if (op === 'lt') {
      return val1 < val2 ? options.fn(this) : options.inverse(this);
    }

    if (op === 'lte') {
      return val1 <= val2 ? options.fn(this) : options.inverse(this);
    }

    throw new Error(`Unknown operator (${op})`);
  }
};
