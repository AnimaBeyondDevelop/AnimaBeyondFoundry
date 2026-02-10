import { collectEditablePaths } from '../../../module/actor/types/collectEditablePaths.js';

export const collectEditablePathsHelper = {
  name: 'collectEditablePaths',
  fn: function (defaultsObject) {
    if (!defaultsObject || typeof defaultsObject !== 'object') return [];
    return collectEditablePaths(defaultsObject);
  }
};
