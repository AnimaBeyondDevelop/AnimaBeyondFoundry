export const getPropertyHelper = {
  name: 'getProperty',
  fn: function (obj, path, fallback = undefined) {
    if (!obj || typeof path !== 'string') return fallback;

    try {
      const value = foundry.utils.getProperty(obj, path);
      return value !== undefined ? value : fallback;
    } catch {
      return fallback;
    }
  }
};
