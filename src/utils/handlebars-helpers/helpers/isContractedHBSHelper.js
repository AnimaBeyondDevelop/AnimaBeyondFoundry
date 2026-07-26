/**
 * Whether a contractible group should render as contracted.
 * @param {unknown} storedValue - Value from system.ui.contractibleItems[id]
 * @param {unknown} contractedByDefault - When stored value is unset, use this default
 */
export const isContractedHBSHelper = {
  name: 'isContracted',
  fn: (storedValue, contractedByDefault) => {
    if (storedValue === true || storedValue === 'true') return true;
    if (storedValue === false || storedValue === 'false') return false;
    return !!contractedByDefault;
  }
};
