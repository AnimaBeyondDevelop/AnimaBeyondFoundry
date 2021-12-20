export const calculateAttributeModifier = (value: number) => {
  if (value < 4) {
    return value * 10 - 40;
  }

  return (Math.floor((value + 5) / 5) + Math.floor((value + 4) / 5) + Math.floor((value + 2) / 5) - 4) * 5;
};
