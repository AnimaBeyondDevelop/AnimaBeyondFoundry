import { isHBSHelper } from './isHBSHelper';
import { calculateExperienceHBSHelper } from './calculateExperienceHBSHelper';
import { concatHBSHelper } from './concatHBSHelper';

export type HandlebarsHelper<T> = { name: string; fn: (...args: unknown[]) => T };

export const registerHelpers = () => {
  const helpers: HandlebarsHelper<unknown>[] = [
    concatHBSHelper,
    isHBSHelper,
    calculateExperienceHBSHelper
  ];

  for (const helper of helpers) {
    Handlebars.registerHelper(helper.name, helper.fn);
  }
};
