import { HandlebarsHelper } from '../registerHelpers';

export const iterateNumberHBSHelper: HandlebarsHelper<string> = {
  name: 'iterateNumber',
  fn: (n: number, block: { fn: (number) => number }) => {
    let accum = '';

    for (let i = 0; i < n; i += 1) accum += block.fn(i);

    return accum;
  }
};
