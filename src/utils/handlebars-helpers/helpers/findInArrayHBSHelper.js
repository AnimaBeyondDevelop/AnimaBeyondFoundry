export const findInArrayHBSHelper = {
  name: 'findInArray',
  fn: (array, k, n, m, v) => {
    v = typeof v === 'string' ? v.split('|') : [v]

    switch (k + n + m) {
      case k:
        return !!array.find(i => i[k] === v[0] || i[k] === v[1])
      case k + n:
        return !!array.find(i => i[k][n] === v[0] || i[k][n] === v[1])
      case k + n + m:
        return !!array.find(i => i[k][n][m] === v[0] || i[k][n][m] === v[1])
      default:
        return false
    }
  }
};
