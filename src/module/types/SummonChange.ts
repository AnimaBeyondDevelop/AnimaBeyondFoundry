export type SummonChanges = {
  [key: string]: {
    name: string;
    data: {
      cost: { value: number };
    };
  };
};
