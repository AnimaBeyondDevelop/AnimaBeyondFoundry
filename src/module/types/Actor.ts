export type ABFActorDataSourceData = {
  version: number;
  ui: {
    contractibleItems: {};
    tabVisibility: {
      mystic: {
        value: boolean;
      };
      domine: {
        value: boolean;
      };
      psychic: {
        value: boolean;
      };
    };
  };
  general: {
    modifiers: {
      physicalActions: {
        value: number;
      };
      allActions: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      naturalPenalty: {
        byArmors: {
          value: number;
        };
        byWearArmorRequirement: {
          value: number;
        };
      };
    };
    destinyPoints: {
      base: {
        value: number;
      };
      final: {
        value: number;
      };
    };
    presence: {
      value: number;
    },
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
      gender: {
        value: string;
      };
      race: {
        value: string;
      };
      appearance: {
        value: string;
      };
      size: {
        value: number;
      };
    };
    advantages: [];
    contacts: [];
    inventory: [];
    money: {
      cooper: {
        value: number;
      };
      silver: {
        value: number;
      };
      gold: {
        value: number;
      };
    };
    description: {
      value: string;
    };
    disadvantages: [];
    elan: [];
    experience: {
      current: { value: number };
      next: { value: number };
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
        mod: number;
      };
      constitution: {
        value: number;
        mod: number;
      };
      dexterity: {
        value: number;
        mod: number;
      };
      strength: {
        value: number;
        mod: number;
      };
      intelligence: {
        value: number;
        mod: number;
      };
      perception: {
        value: number;
        mod: number;
      };
      power: {
        value: number;
        mod: number;
      };
      willPower: {
        value: number;
        mod: number;
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
        final: {
          value: number;
        };
      };
      fatigue: {
        value: number;
        max: number;
      };
      movementType: {
        mod: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      movement: {
        maximum: {
          value: number;
        };
        running: {
          value: number;
        };
      };
      resistances: {
        physical: {
          base: {
            value: number;
          };
          final: {
            value: number;
          };
        };
        disease: {
          base: {
            value: number;
          };
          final: {
            value: number;
          };
        };
        poison: {
          base: {
            value: number;
          };
          final: {
            value: number;
          };
        };
        magic: {
          base: {
            value: number;
          };
          final: {
            value: number;
          };
        };
        psychic: {
          base: {
            value: number;
          };
          final: {
            value: number;
          };
        };
      };
    };
  };

  secondaries: {
    athletics: {
      acrobatics: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      athleticism: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      ride: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      swim: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      climb: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      jump: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      piloting: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
    };
    vigor: {
      composure: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      featsOfStrength: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      withstandPain: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
    };
    perception: {
      notice: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      search: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      track: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
    };
    intellectual: {
      animals: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      science: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      law: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      herbalLore: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      history: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      tactics: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      medicine: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      memorize: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      navigation: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      occult: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      appraisal: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      magicAppraisal: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
    };
    social: {
      style: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      intimidate: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      leadership: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      persuasion: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      trading: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      streetwise: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      etiquette: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
    };
    subterfuge: {
      lockPicking: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      disguise: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      hide: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      theft: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      stealth: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      trapLore: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      poisons: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
    };
    creative: {
      art: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      dance: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      forging: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      runes: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      alchemy: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      animism: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      music: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      sleightOfHand: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      ritualCalligraphy: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      jewelry: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      tailoring: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      puppetMaking: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
    };
    secondarySpecialSkills: [];
  };

  combat: {
    attack: {
      base: {
        value: number;
      };
      final: {
        value: number;
      };
    };
    block: {
      base: {
        value: number;
      };
      final: {
        value: number;
      };
    };
    dodge: {
      base: {
        value: number;
      };
      final: {
        value: number;
      };
    };
    wearArmor: {
      value: number;
    };
    totalArmor: {
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
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      alternative: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
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
      base: {
        value: number;
      };
      final: {
        value: number;
      };
      imbalance: {
        offensive: {
          base: {
            value: number;
          };
          final: {
            value: number;
          };
        };
        defensive: {
          base: {
            value: number;
          };
          final: {
            value: number;
          };
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
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      banish: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      bind: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      control: {
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
    };
    spells: [];
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
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      agility: {
        accumulated: {
          value: number;
        };
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      dexterity: {
        accumulated: {
          value: number;
        };
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      constitution: {
        accumulated: {
          value: number;
        };
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      willPower: {
        accumulated: {
          value: number;
        };
        base: {
          value: number;
        };
        final: {
          value: number;
        };
      };
      power: {
        accumulated: {
          value: number;
        };
        base: {
          value: number;
        };
        final: {
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
      base: {
        value: number;
      };
      final: {
        value: number;
      };
    };
    psychicProjection: {
      base: {
        value: number;
      };
      final: {
        value: number;
      };
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
