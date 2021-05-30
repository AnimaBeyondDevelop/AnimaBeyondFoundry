import { SkillChange } from './SkillChange';

export type ItemChanges = {
  data: {
    dynamic: {
      skill: SkillChange;
    };
  };
};
