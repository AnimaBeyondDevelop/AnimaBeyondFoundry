/**
 * @param {number} value
 */
export const calculateAttributeModifier = value => {
  if (value <= 0) {
    return 0;
  }
  if (value < 4) {
    return value * 10 - 40;
  }

  return Math.min(
    (Math.floor((value + 5) / 5) +
      Math.floor((value + 4) / 5) +
      Math.floor((value + 2) / 5) -
      4) *
      5,
    45
  );
};
