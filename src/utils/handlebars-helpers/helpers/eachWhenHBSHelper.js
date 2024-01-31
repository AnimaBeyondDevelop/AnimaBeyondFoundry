export const eachWhenHBSHelper = {
  name: 'each_when',
  fn: (list, k, n, m, v, opts) => {
    var i,
      result = '';
    v = v.split('|');
    if (m === '') {
      if (n === '') {
        for (i = 0; i < list.length; ++i)
          if (
            list[i][k] === v[0] ||
            list[i][k] === v[1] ||
            list[i][k] === v[2] ||
            list[i][k] === v[3] ||
            list[i][k] === v[4] ||
            list[i][k] === v[5] ||
            list[i][k] === v[6] ||
            list[i][k] === v[7] ||
            list[i][k] === v[8]
          )
            result = result + opts.fn(list[i]);
        return result;
      }
      for (i = 0; i < list.length; ++i)
        if (list[i][k][n] === v[0] || list[i][k][n] === v[1])
          result = result + opts.fn(list[i]);
      return result;
    }
    for (i = 0; i < list.length; ++i)
      if (list[i][k][n][m] === v[0] || list[i][k][n][m] === v[1])
        result = result + opts.fn(list[i]);
    return result;
  }
};
