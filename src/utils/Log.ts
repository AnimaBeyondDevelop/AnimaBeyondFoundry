export const Log = {
  log(...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.log('AnimaBF |', ...args);
  },
  warn(...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.warn('AnimaBF |', ...args);
  },
  error(...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.error('AnimaBF |', ...args);
  }
};
