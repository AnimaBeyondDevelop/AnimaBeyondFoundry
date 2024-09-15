export const iterateNumberHBSHelper = {
  name: 'iterateNumber',
  fn: (n, block) => {
    let accum = '';

    for (let i = 0; i < n; i += 1) accum += block.fn(i);

    return accum;
  }
};
