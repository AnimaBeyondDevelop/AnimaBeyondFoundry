import { isHBSHelper } from './helpers/isHBSHelper';
import { calculateExperienceHBSHelper } from './helpers/calculateExperienceHBSHelper';
import { concatHBSHelper } from './helpers/concatHBSHelper';
import { getKeyOfHBSHelper } from './helpers/getKeyOfHBSHelper';
import { manipulateStringHBSHelper } from './helpers/manipulateStringHBSHelper';
import { mathHBSHelper } from './helpers/mathHBSHelper';
import { getDifficultyFromIndexHBSHelper } from './helpers/getDifficultyFromIndexHBSHelper';
import { iterateNumberHBSHelper } from './helpers/iterateNumberHBSHelper';
import { notHBSHelper } from './helpers/notHBSHelper';
import { minNumberHBSHelper } from './helpers/minNumberHBSHelper';
import { eachWhenHBSHelper } from './helpers/eachWhenHBSHelper.js';
import { logHBSHelper } from './helpers/logHBSHelper';

export type HandlebarsHelper<T> = { name: string; fn: (...args: unknown[]) => T };

export const registerHelpers = () => {
  const helpers: HandlebarsHelper<unknown>[] = [
    calculateExperienceHBSHelper,
    concatHBSHelper,
    notHBSHelper,
    getDifficultyFromIndexHBSHelper,
    getKeyOfHBSHelper,
    isHBSHelper,
    iterateNumberHBSHelper,
    manipulateStringHBSHelper,
    mathHBSHelper,
    minNumberHBSHelper,
    eachWhenHBSHelper,
    logHBSHelper
  ];

  for (const helper of helpers) {
    Handlebars.registerHelper(helper.name, helper.fn);
  }
};
