export const getKeyOfHBSHelper = {
  name: 'getKeyOf',
  fn: dataKey => {
    if (!dataKey.startsWith('data')) {
      throw Error('getKeyOf handlebar helper: parameter must start with "data"');
    }

    return dataKey.substr('data.'.length);
  }
};
