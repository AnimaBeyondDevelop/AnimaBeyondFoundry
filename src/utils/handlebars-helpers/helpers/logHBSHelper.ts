import { HandlebarsHelper } from '../registerHelpers';

export const logHBSHelper: HandlebarsHelper<any> = {
  name: 'log',
  fn: (something: any) => {
    // eslint-disable-next-line no-console
    console.log(something);
  }
};
