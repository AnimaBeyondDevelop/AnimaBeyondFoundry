import { isHBSHelper } from './helpers/isHBSHelper';
import { calculateExperienceHBSHelper } from './helpers/calculateExperienceHBSHelper';
import { concatHBSHelper } from './helpers/concatHBSHelper';
import { getKeyOfHBSHelper } from './helpers/getKeyOfHBSHelper';
import { manipulateStringHBSHelper } from './helpers/manipulateStringHBSHelper';
import { mathHBSHelper } from './helpers/mathHBSHelper';
import { getDifficultyFromIndexHBSHelper } from './helpers/getDifficultyFromIndexHBSHelper';

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
