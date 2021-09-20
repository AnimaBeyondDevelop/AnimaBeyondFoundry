const service = () => {
  let nextValue;

  return {
    setNextValue(value: number | undefined) {
      nextValue = value;
    },
    getNextValue() {
      return nextValue;
    }
  };
};

export const nextValueService = service();
