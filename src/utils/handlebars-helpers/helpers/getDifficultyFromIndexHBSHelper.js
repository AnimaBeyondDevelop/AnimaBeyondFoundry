const DIFFICULTIES = [20, 40, 80, 120, 140, 180, 240, 280, 320, 440];

export const getDifficultyFromIndexHBSHelper = {
  name: 'getDifficultyFromIndex',
  fn: index => {
    return DIFFICULTIES[index];
  }
};
