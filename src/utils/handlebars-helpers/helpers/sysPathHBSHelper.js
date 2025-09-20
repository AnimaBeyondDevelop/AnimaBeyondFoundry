// utils/handlebars-helpers/helpers/sysPathHBSHelper.js
export const sysTpl = {
  name: 'sysTpl',
  fn: relPath => {
    const id = game.system?.id ?? 'animabf';
    return `systems/${id}/${relPath}`;
  }
};

export const sysAsset = {
  name: 'sysAsset',
  fn: relPath => {
    const id = game.system?.id ?? 'animabf';
    return `/systems/${id}/${relPath}`;
  }
};
