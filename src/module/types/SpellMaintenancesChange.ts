export type SpellMaintenancesChanges = {
  [key: string]: {
    name: string;
    data: {
      cost: { value: number };
    };
  };
};
