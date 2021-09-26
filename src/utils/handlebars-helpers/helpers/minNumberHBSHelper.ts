import { HandlebarsHelper } from '../registerHelpers';
import { Log } from '../../Log';

export const minNumberHBSHelper: HandlebarsHelper<string> = {
  name: 'minNumber',
  fn: (first: number, second: number) => {
    const result = Math.min(first, second);
    // eslint-disable-next-line no-console
    Log.log(result);
    return result.toString();
  }
};
