// The [key:string] value usually is the ID of the skill
export type SkillChange = {
  [key: string]: {
    data: {
      level: { value: number };
    };
  };
};
