export const calculateMovementInMetersFromMovementType = (movementType: number): number => {
  switch (movementType) {
    case 0:
      return 0.5;
    case 1:
      return 1;
    case 2:
      return 4;
    case 3:
      return 8;
    case 4:
      return 15;
    case 5:
      return 20;
    case 6:
      return 22;
    case 7:
      return 25;
    case 8:
      return 28;
    case 9:
      return 32;
    case 10:
      return 35;
    case 11:
      return 40;
    case 12:
      return 50;
    case 13:
      return 80;
    case 14:
      return 150;
    case 15:
      return 250;
    case 16:
      return 500;
    case 17:
      return 1000;
    case 18:
      return 5000;
    case 19:
      return 25000;
    default:
      return 9999999;
  }
};
