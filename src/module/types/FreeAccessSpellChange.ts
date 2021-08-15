// The [key:string] value usually is the ID of the free access spell as item
export type FreeAccessSpellChange = {
  [key: string]: {
    name: string;
    data: {
      level: { value: number };
    };
  };
};
