import { HandlebarsHelper } from '../registerHelpers';

export const minNumberHBSHelper: HandlebarsHelper<number> = {
  name: 'minNumber',
  fn: (first: number, second: number) => Math.min(first, second)
};
