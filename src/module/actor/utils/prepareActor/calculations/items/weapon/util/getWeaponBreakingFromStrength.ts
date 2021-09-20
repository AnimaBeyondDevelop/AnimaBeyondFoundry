export const getWeaponBreakingFromStrength = (strength: number): number => {
  switch (strength) {
    case 8:
    case 9:
      return 1;
    case 10:
      return 2;
    case 11:
    case 12:
      return 3;
    case 13:
    case 14:
      return 4;
    default:
      if (strength > 15) return 5;

      return 0;
  }
};
