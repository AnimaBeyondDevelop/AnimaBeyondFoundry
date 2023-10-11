export const calculateLanguagesHBSHelper = {
  name: 'calculateLanguages',
  fn: (inteligence) => {
    if (inteligence === 6) {
      return 2;
    }
    if (inteligence === 7) {
      return 3;
    }
    if ([8, 9].includes(inteligence)) {
      return 4;
    }
    if (inteligence === 10) {
      return 5;
    }
    if (inteligence === 11) {
      return 6;
    }
    if (inteligence === 12) {
      return 7;
    }
    if (inteligence === 13) {
      return 8;
    }
    if (inteligence === 14) {
      return 9;
    }
    if (inteligence > 14) {
      return 10;
    }
    return 1;
  }
};
