export type ABFActorDataSourceData = {
  general: {
    modifiers: {
      physicalActions: {
        value: number;
      };
      allActions: {
        value: number;
      };
    };
    aspect: {
      hair: {
        value: string;
      };
      eyes: {
        value: string;
      };
      height: {
        value: string;
      };
      weight: {
        value: string;
      };
      age: {
        value: string;
      };
      genre: {
        value: string;
      };
      race: {
        value: string;
      };
      appearance: {
        value: number;
      };
      size: {
        value: number;
      };
    };
    advantages: [];
    contacts: [];
    description: {
      value: string;
    };
    disadvantages: [];
    elan: [];
    experience: {
      current: { value: number };
      next: { value: number };
    };
    fatigue: {
      value: number;
      max: number;
    };
    languages: {
      base: {
        value: string;
      };
      others: [];
    };
    levels: [];
    notes: [];
    titles: [];
  };

  characteristics: {
    primaries: {
      agility: {
        value: number;
      };
      constitution: {
        value: number;
      };
      dexterity: {
        value: number;
      };
      strength: {
        value: number;
      };
      intelligence: {
        value: number;
      };
      perception: {
        value: number;
      };
      power: {
        value: number;
      };
      willPower: {
        value: number;
      };
    };
    secondaries: {
      lifePoints: {
        value: number;
        max: number;
      };
      initiative: {
        base: {
          value: number;
        };
        primary: {
          value: number;
        };
        secondary: {
          value: number;
        };
      };
      fatigue: {
        value: number;
        max: number;
      };
      movement: {
        value: number;
      };
      resistances: {
        physical: {
          value: number;
        };
        disease: {
          value: number;
        };
        poison: {
          value: number;
        };
        magic: {
          value: number;
        };
        psychic: {
          value: number;
        };
      };
    };
  };

  secondaries: {
    athletics: {
      acrobatics: {
        value: number;
      };
      athleticism: {
        value: number;
      };
      ride: {
        value: number;
      };
      swim: {
        value: number;
      };
      climb: {
        value: number;
      };
      jump: {
        value: number;
      };
      piloting: {
        value: number;
      };
    };
    vigor: {
      composure: {
        value: number;
      };
      featsOfStrength: {
        value: number;
      };
      withstandPain: {
        value: number;
      };
    };
    perception: {
      notice: {
        value: number;
      };
      search: {
        value: number;
      };
      track: {
        value: number;
      };
    };
    intellectual: {
      animals: {
        value: number;
      };
      science: {
        value: number;
      };
      law: {
        value: number;
      };
      herbalLore: {
        value: number;
      };
      history: {
        value: number;
      };
      tactics: {
        value: number;
      };
      medicine: {
        value: number;
      };
      memorize: {
        value: number;
      };
      navigation: {
        value: number;
      };
      occult: {
        value: number;
      };
      appraisal: {
        value: number;
      };
      magicAppraisal: {
        value: number;
      };
    };
    social: {
      style: {
        value: number;
      };
      intimidate: {
        value: number;
      };
      leadership: {
        value: number;
      };
      persuasion: {
        value: number;
      };
      trading: {
        value: number;
      };
      streetwise: {
        value: number;
      };
      etiquette: {
        value: number;
      };
    };
    subterfuge: {
      lockPicking: {
        value: number;
      };
      disguise: {
        value: number;
      };
      hide: {
        value: number;
      };
      theft: {
        value: number;
      };
      stealth: {
        value: number;
      };
      trapLore: {
        value: number;
      };
      poisons: {
        value: number;
      };
    };
    creative: {
      art: {
        value: number;
      };
      dance: {
        value: number;
      };
      forging: {
        value: number;
      };
      runes: {
        value: number;
      };
      alchemy: {
        value: number;
      };
      animism: {
        value: number;
      };
      music: {
        value: number;
      };
      sleightOfHand: {
        value: number;
      };
      ritualCalligraphy: {
        value: number;
      };
      jewelry: {
        value: number;
      };
      tailoring: {
        value: number;
      };
    };
    secondarySpecialSkills: [];
  };

  combat: {
    attack: {
      value: number;
    };
    block: {
      value: number;
    };
    dodge: {
      value: number;
    };
    armor: {
      name: {
        value: string;
      };
      at: {
        cut: {
          value: number;
        };
        impact: {
          value: number;
        };
        thrust: {
          value: number;
        };
        heat: {
          value: number;
        };
        electricity: {
          value: number;
        };
        cold: {
          value: number;
        };
        energy: {
          value: number;
        };
      };
    };
    combatSpecialSkills: [];
    combatTables: [];
    ammo: [];
    weapons: [];
    armors: [];
  };

  mystic: {
    act: {
      main: {
        value: number;
      };
      alternative: {
        value: number;
      };
    };
    zeon: {
      accumulated: number;
      value: number;
      max: number;
    };
    zeonRegeneration: {
      base: {
        value: number;
      };
      final: {
        value: number;
      };
    };
    innateMagic: {
      main: {
        value: number;
      };
      alternative: {
        value: number;
      };
    };
    magicProjection: {
      final: {
        value: number;
      };
      imbalance: {
        offensive: {
          value: number;
        };
        defensive: {
          value: number;
        };
      };
    };
    magicLevel: {
      spheres: {
        essence: {
          value: number;
        };
        water: {
          value: number;
        };
        earth: {
          value: number;
        };
        creation: {
          value: number;
        };
        darkness: {
          value: number;
        };
        necromancy: {
          value: number;
        };
        light: {
          value: number;
        };
        destruction: {
          value: number;
        };
        air: {
          value: number;
        };
        fire: {
          value: number;
        };
        illusion: {
          value: number;
        };
      };
      total: {
        value: number;
      };
      used: {
        value: number;
      };
    };
    summoning: {
      summon: {
        value: number;
      };
      banish: {
        value: number;
      };
      bind: {
        value: number;
      };
      control: {
        value: number;
      };
    };
    freeAccessSpells: [];
    spellMaintenances: [];
    selectedSpells: [];
    summons: [];
    metamagics: [];
  };

  domine: {
    kiSkills: [];
    nemesisSkills: [];
    arsMagnus: [];
    martialArts: [];
    creatures: [];
    specialSkills: [];
    techniques: [];
    seals: {
      minor: {
        earth: {
          isActive: boolean;
        };
        metal: {
          isActive: boolean;
        };
        wind: {
          isActive: boolean;
        };
        water: {
          isActive: boolean;
        };
        wood: {
          isActive: boolean;
        };
      };
      major: {
        earth: {
          isActive: boolean;
        };
        metal: {
          isActive: boolean;
        };
        wind: {
          isActive: boolean;
        };
        water: {
          isActive: boolean;
        };
        wood: {
          isActive: boolean;
        };
      };
    };
    martialKnowledge: {
      used: {
        value: number;
      };
      max: {
        value: number;
      };
    };
    kiAccumulation: {
      strength: {
        accumulated: {
          value: number;
        };
        current: {
          value: number;
        };
        total: {
          value: number;
        };
      };
      agility: {
        accumulated: {
          value: number;
        };
        current: {
          value: number;
        };
        total: {
          value: number;
        };
      };
      dexterity: {
        accumulated: {
          value: number;
        };
        current: {
          value: number;
        };
        total: {
          value: number;
        };
      };
      constitution: {
        accumulated: {
          value: number;
        };
        current: {
          value: number;
        };
        total: {
          value: number;
        };
      };
      willPower: {
        accumulated: {
          value: number;
        };
        current: {
          value: number;
        };
        total: {
          value: number;
        };
      };
      power: {
        accumulated: {
          value: number;
        };
        current: {
          value: number;
        };
        total: {
          value: number;
        };
      };
      generic: {
        value: number;
        max: number;
      };
    };
  };

  psychic: {
    psychicPotential: {
      value: number;
    };
    psychicProjection: {
      value: number;
    };
    psychicPoints: {
      value: number;
      max: number;
    };
    psychicPowers: [];
    psychicDisciplines: [];
    mentalPatterns: [];
    innatePsychicPower: {
      amount: {
        value: number;
      };
    };
    innatePsychicPowers: [];
  };
};
