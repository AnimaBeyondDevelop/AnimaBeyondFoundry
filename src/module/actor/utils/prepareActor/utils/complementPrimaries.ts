export type PrimariesWithoutModifier = {
  agility: { value: number };
  constitution: { value: number };
  dexterity: { value: number };
  strength: { value: number };
  intelligence: { value: number };
  perception: { value: number };
  power: { value: number };
  willPower: { value: number };
};

export type Primaries = {
  agility: { value: number; mod: number };
  constitution: { value: number; mod: number };
  dexterity: { value: number; mod: number };
  strength: { value: number; mod: number };
  intelligence: { value: number; mod: number };
  perception: { value: number; mod: number };
  power: { value: number; mod: number };
  willPower: { value: number; mod: number };
};

const getModifier = (value: number) => {
  if (value < 4) {
    return value * 10 - 40;
  }

  return (
    (Math.floor((value + 5) / 5) +
      Math.floor((value + 4) / 5) +
      Math.floor((value + 2) / 5) -
      4) *
    5
  );
};

/**
 * Adds to primary characteristics object without modifiers its modifiers,
 * calculated based on its value
 * @param primaries
 */
export const complementPrimaries = (primaries: PrimariesWithoutModifier): Primaries => {
  return {
    agility: {
      ...primaries.agility,
      mod: getModifier(primaries.agility.value)
    },
    constitution: {
      ...primaries.constitution,
      mod: getModifier(primaries.constitution.value)
    },
    dexterity: {
      ...primaries.dexterity,
      mod: getModifier(primaries.dexterity.value)
    },
    strength: {
      ...primaries.strength,
      mod: getModifier(primaries.strength.value)
    },
    intelligence: {
      ...primaries.intelligence,
      mod: getModifier(primaries.intelligence.value)
    },
    perception: {
      ...primaries.perception,
      mod: getModifier(primaries.perception.value)
    },
    power: {
      ...primaries.power,
      mod: getModifier(primaries.power.value)
    },
    willPower: {
      ...primaries.willPower,
      mod: getModifier(primaries.willPower.value)
    }
  };
};
