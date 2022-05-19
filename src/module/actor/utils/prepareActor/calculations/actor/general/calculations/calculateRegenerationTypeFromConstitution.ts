export const calculateRegenerationTypeFromConstitution = (constitution: number): number => {
  switch(Math.max(Math.min(constitution, 20), 0)) {
    case undefined:
    case 0:
    case 1:
    case 2:
      return 0;
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
      return 1;
    case 8:
    case 9:
      return 2;
    case 20:
      return 12;
    default:
      return constitution - 7;
  }
};
