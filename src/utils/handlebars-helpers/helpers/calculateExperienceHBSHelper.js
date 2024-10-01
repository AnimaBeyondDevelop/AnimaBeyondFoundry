export const calculateExperienceHBSHelper = {
  name: 'calculateExperience',
  fn: (current, next) => {
    return (current / next) * 100;
  }
};
