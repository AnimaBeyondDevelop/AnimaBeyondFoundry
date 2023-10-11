export const calculateLevelsHBSHelper = {
    name: 'calculateLevels',
    fn: (levels) => {
      if (levels) {
        return levels.reduce((accum, current) => accum + current.system.level, 0);
      }
      return 0;
    }
  };