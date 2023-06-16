/* eslint-disable eqeqeq */

export const isHBSHelper = {
  name: 'is',
  fn: (op, val1, val2) => {
    const [realOp, isDebug] = op.toString().split(':');

    if (isDebug === 'debug') {
      // debug mode
    }

    if (realOp === 'neq') {
      return val1 != val2 ? true : false;
    }

    if (realOp === 'eq') {
      return val1 == val2 ? true : false;
    }

    if (realOp === 'gt') {
      return val1 > val2 ? true : false;
    }

    if (realOp === 'gte') {
      return val1 >= val2 ? true : false;
    }

    if (realOp === 'lt') {
      return val1 < val2 ? true : false;
    }

    if (realOp === 'lte') {
      return val1 <= val2 ? true : false;
    }

    throw new Error(`Unknown operator (${realOp})`);
  }
};
