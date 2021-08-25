import { HandlebarsHelper } from '../registerHelpers';

export const mathHBSHelper: HandlebarsHelper<number> = {
  name: 'math',
  fn: (...rawArgs) => {
    const validArgs = rawArgs.filter(
      arg => typeof arg === 'string' || typeof arg === 'number'
    );
    // eslint-disable-next-line no-eval
    return eval(validArgs.join(''));
  }
};
