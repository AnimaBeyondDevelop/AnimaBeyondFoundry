import { HandlebarsHelper } from '../registerHelpers';

const DIFFICULTIES = [20, 40, 80, 120, 140, 180, 240, 280, 320, 440];

export const getDifficultyFromIndexHBSHelper: HandlebarsHelper<number> = {
  name: 'getDifficultyFromIndex',
  fn: (index: number) => {
    return DIFFICULTIES[index];
  }
};
