export type SelectedSpellsChange = {
  [key: string]: {
    name: string;
    data: {
      cost: { value: number };
    };
  };
};
