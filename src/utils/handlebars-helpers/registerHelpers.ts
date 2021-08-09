import { isHBSHelper } from './isHBSHelper';
import { calculateExperienceHBSHelper } from './calculateExperienceHBSHelper';
import { concatHBSHelper } from './concatHBSHelper';
import { getKeyOfHBSHelper } from './getKeyOfHBSHelper';
import { manipulateStringHBSHelper } from './manipulateStringHBSHelper';

export type HandlebarsHelper<T> = { name: string; fn: (...args: unknown[]) => T };

export const registerHelpers = () => {
  const helpers: HandlebarsHelper<unknown>[] = [
    concatHBSHelper,
    isHBSHelper,
    calculateExperienceHBSHelper,
    getKeyOfHBSHelper,
    manipulateStringHBSHelper
  ];

  for (const helper of helpers) {
    Handlebars.registerHelper(helper.name, helper.fn);
  }
};
