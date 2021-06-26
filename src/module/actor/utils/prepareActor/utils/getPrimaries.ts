export type PrimariesWithoutModifier = {
  agi: { value: number };
  con: { value: number };
  dex: { value: number };
  str: { value: number };
  int: { value: number };
  per: { value: number };
  pow: { value: number };
  will: { value: number };
};

export type Primaries = {
  agi: { value: number; mod: number };
  con: { value: number; mod: number };
  dex: { value: number; mod: number };
  str: { value: number; mod: number };
  int: { value: number; mod: number };
  per: { value: number; mod: number };
  pow: { value: number; mod: number };
  will: { value: number; mod: number };
};

const getModifier = (value: number) => {
  if (value < 4) {
    return value * 10 - 40;
  } else {
    return (
      (Math.floor((value + 5) / 5) +
        Math.floor((value + 4) / 5) +
        Math.floor((value + 2) / 5) -
        4) *
      5
    );
  }
};

export const getPrimaries = (primaries: PrimariesWithoutModifier): Primaries => {
  return {
    con: {
      ...primaries.con,
      mod: getModifier(primaries.con.value)
    },
    agi: {
      ...primaries.agi,
      mod: getModifier(primaries.agi.value)
    },
    dex: {
      ...primaries.dex,
      mod: getModifier(primaries.dex.value)
    },
    int: {
      ...primaries.int,
      mod: getModifier(primaries.int.value)
    },
    per: {
      ...primaries.per,
      mod: getModifier(primaries.per.value)
    },
    pow: {
      ...primaries.pow,
      mod: getModifier(primaries.pow.value)
    },
    str: {
      ...primaries.str,
      mod: getModifier(primaries.str.value)
    },
    will: {
      ...primaries.will,
      mod: getModifier(primaries.will.value)
    }
  };
};
