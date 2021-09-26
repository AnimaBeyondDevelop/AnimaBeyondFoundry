import { HandlebarsHelper } from '../registerHelpers';

export const minNumberHBSHelper: HandlebarsHelper<string> = {
  name: 'minNumber',
  fn: (first: number, second: number) => Math.min(first, second).toString()
};
