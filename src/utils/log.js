export const Logger = {
  log(...args) {
    // eslint-disable-next-line no-console
    console.log('AnimaBF |', ...args);
  },
  warn(...args) {
    // eslint-disable-next-line no-console
    console.warn('AnimaBF |', ...args);
  },
  error(...args) {
    // eslint-disable-next-line no-console
    console.error('AnimaBF |', ...args);
  }
};
