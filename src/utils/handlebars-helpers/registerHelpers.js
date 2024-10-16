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
import { eachWhenHBSHelper } from './helpers/eachWhenHBSHelper';
import { getNameActorUuid } from './helpers/getNameActorUuid';
import { isArrayEmpty } from './helpers/isArrayEmpty';
import { logHBSHelper } from './helpers/logHBSHelper';
import { calculateLevelsHBSHelper } from './helpers/calculateLevelsHBSHelper';
import { calculateLanguagesHBSHelper } from './helpers/calculateLanguagesHBSHelper';

export const registerHelpers = () => {
  const helpers = [
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
    getNameActorUuid,
    isArrayEmpty,
    logHBSHelper,
    calculateLanguagesHBSHelper,
    calculateLevelsHBSHelper
  ];

  for (const helper of helpers) {
    Handlebars.registerHelper(helper.name, helper.fn);
  }
};
