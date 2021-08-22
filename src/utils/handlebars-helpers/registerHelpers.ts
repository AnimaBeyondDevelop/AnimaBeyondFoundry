import { isHBSHelper } from './isHBSHelper';
import { calculateExperienceHBSHelper } from './calculateExperienceHBSHelper';
import { concatHBSHelper } from './concatHBSHelper';
import { getKeyOfHBSHelper } from './getKeyOfHBSHelper';
import { manipulateStringHBSHelper } from './manipulateStringHBSHelper';
import { mathHBSHelper } from './mathHBSHelper';
import { getDifficultyFromIndexHBSHelper } from './getDifficultyFromIndexHBSHelper';

export type HandlebarsHelper<T> = { name: string; fn: (...args: unknown[]) => T };

export const registerHelpers = () => {
  const helpers: HandlebarsHelper<unknown>[] = [
    calculateExperienceHBSHelper,
    concatHBSHelper,
    getDifficultyFromIndexHBSHelper,
    getKeyOfHBSHelper,
    isHBSHelper,
    manipulateStringHBSHelper,
    mathHBSHelper
  ];

  for (const helper of helpers) {
    Handlebars.registerHelper(helper.name, helper.fn);
  }
};
