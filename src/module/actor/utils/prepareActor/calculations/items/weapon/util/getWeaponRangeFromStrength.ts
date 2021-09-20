export const getWeaponRangeFromStrength = (strength: number): number | undefined => {
  switch (strength) {
    case 3:
      return -30;
    case 4:
      return -10;
    case 5:
    case 6:
      return 0;
    case 7:
      return 10;
    case 8:
      return 20;
    case 9:
      return 30;
    case 10:
      return 50;
    case 11:
      return 100;
    case 12:
      return 250;
    case 13:
      return 500;
    case 14:
      return 1000;
    case 15:
      return 5000;
    default:
      if (strength > 15) return 10000;
  }

  return undefined;
};
