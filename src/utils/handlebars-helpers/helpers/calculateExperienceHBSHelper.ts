import { HandlebarsHelper } from '../registerHelpers';

export const calculateExperienceHBSHelper: HandlebarsHelper<number> = {
  name: 'calculateExperience',
  fn: (current: number, next: number) => {
    return (current / next) * 100;
  }
};
