import { writable } from 'svelte/store';

/**
 * Creates a writable store with a debounced subscribe method
 * @template T The type of the values in the store
 * @param {T} [value] The initial value of the store
 * @returns {import(".").DebouncedStore<T>}
 */
export function debouncedStore(value) {
  const store = writable(value);

  /** @type {number[]} */
  let timeoutIDs = [];

  return {
    ...store,
    debounceSubscribe(fn, timeout = 500) {
      let id = timeoutIDs.length;
      return store.subscribe(v => {
        clearTimeout(timeoutIDs[id]);
        timeoutIDs[id] = setTimeout(() => {
          fn(v);
        }, timeout);
      });
    }
  };
}
