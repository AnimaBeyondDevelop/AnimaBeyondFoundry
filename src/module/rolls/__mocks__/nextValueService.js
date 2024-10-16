const service = () => {
  /** @type {number} */
  let nextValue;

  return {
    /** @param {number} [value] */
    setNextValue(value) {
      nextValue = value;
    },
    getNextValue() {
      return nextValue;
    }
  };
};

export const nextValueService = service();
