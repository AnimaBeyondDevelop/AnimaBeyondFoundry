export const concatHBSHelper = {
  name: 'concat',
  fn: (...args) => {
    // eslint-disable-next-line no-param-reassign
    delete args[args.length - 1];

    return args.join('');
  }
};
