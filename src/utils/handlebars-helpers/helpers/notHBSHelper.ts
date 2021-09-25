import { HandlebarsHelper } from '../registerHelpers';

export const notHBSHelper: HandlebarsHelper<boolean> = {
  name: 'not',
  fn: (op: unknown, val1: any) => {
    return !val1;
  }
};
