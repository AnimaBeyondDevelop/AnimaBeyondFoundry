import { HandlebarsHelper } from '../registerHelpers';

export const getKeyOfHBSHelper: HandlebarsHelper<void> = {
  name: 'getKeyOf',
  fn: (dataKey: string) => {
    if (!dataKey.startsWith('data')) {
      throw Error('getKeyOf handlebar helper: parameter must start with "data"');
    }

    return dataKey.substr('data.'.length);
  }
};
