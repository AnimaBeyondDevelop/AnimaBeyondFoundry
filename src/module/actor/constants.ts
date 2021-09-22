import { ABFActorDataSourceData } from '../types/Actor';

export const INITIAL_ACTOR_DATA: ABFActorDataSourceData = {
  version: 1,
  ui: {
    contractibleItems: {},
    tabVisibility: {
      mystic: {
        value: true
      },
      domine: {
        value: true
      },
      psychic: {
        value: true
      }
    }
  },
  general: {
    modifiers: {
      physicalActions: {
        value: 0
      },
      allActions: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      naturalPenalty: {
        byArmors: { value: 0 },
        byWearArmorRequirement: { value: 0 }
      }
    },
    destinyPoints: {
      base: {
        value: 0
      },
      final: {
        value: 0
      }
    },
    presence: {
      value: 0
    },
    aspect: {
      hair: {
        value: ''
      },
      eyes: {
        value: ''
      },
      height: {
        value: ''
      },
      weight: {
        value: ''
      },
      age: {
        value: ''
      },
      gender: {
        value: ''
      },
      race: {
        value: ''
      },
      appearance: {
        value: ''
      },
      size: {
        value: 0
      }
    },
    advantages: [],
    contacts: [],
    inventory: [],
    money: {
      cooper: {
        value: 0
      },
      silver: {
        value: 0
      },
      gold: {
        value: 0
      }
    },
    description: {
      value: ''
    },
    disadvantages: [],
    elan: [],
    experience: {
      current: { value: 0 },
      next: { value: 0 }
    },
    languages: {
      base: {
        value: ''
      },
      others: []
    },
    levels: [],
    notes: [],
    titles: []
  },

  characteristics: {
    primaries: {
      agility: {
        value: 0,
        mod: 0
      },
      constitution: {
        value: 0,
        mod: 0
      },
      dexterity: {
        value: 0,
        mod: 0
      },
      strength: {
        value: 0,
        mod: 0
      },
      intelligence: {
        value: 0,
        mod: 0
      },
      perception: {
        value: 0,
        mod: 0
      },
      power: {
        value: 0,
        mod: 0
      },
      willPower: {
        value: 0,
        mod: 0
      }
    },
    secondaries: {
      lifePoints: {
        value: 0,
        max: 0
      },
      initiative: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      fatigue: {
        value: 0,
        max: 0
      },
      movementType: {
        mod: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      movement: {
        maximum: {
          value: 0
        },
        running: {
          value: 0
        }
      },
      resistances: {
        physical: {
          base: {
            value: 0
          },
          final: {
            value: 0
          }
        },
        disease: {
          base: {
            value: 0
          },
          final: {
            value: 0
          }
        },
        poison: {
          base: {
            value: 0
          },
          final: {
            value: 0
          }
        },
        magic: {
          base: {
            value: 0
          },
          final: {
            value: 0
          }
        },
        psychic: {
          base: {
            value: 0
          },
          final: {
            value: 0
          }
        }
      }
    }
  },

  secondaries: {
    athletics: {
      acrobatics: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      athleticism: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      ride: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      swim: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      climb: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      jump: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      piloting: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      }
    },
    vigor: {
      composure: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      featsOfStrength: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      withstandPain: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      }
    },
    perception: {
      notice: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      search: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      track: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      }
    },
    intellectual: {
      animals: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      science: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      law: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      herbalLore: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      history: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      tactics: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      medicine: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      memorize: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      navigation: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      occult: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      appraisal: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      magicAppraisal: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      }
    },
    social: {
      style: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      intimidate: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      leadership: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      persuasion: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      trading: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      streetwise: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      etiquette: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      }
    },
    subterfuge: {
      lockPicking: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      disguise: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      hide: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      theft: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      stealth: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      trapLore: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      poisons: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      }
    },
    creative: {
      art: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      dance: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      forging: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      runes: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      alchemy: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      animism: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      music: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      sleightOfHand: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      ritualCalligraphy: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      jewelry: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      tailoring: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      puppetMaking: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      }
    },
    secondarySpecialSkills: []
  },

  combat: {
    attack: {
      base: {
        value: 0
      },
      final: {
        value: 0
      }
    },
    block: {
      base: {
        value: 0
      },
      final: {
        value: 0
      }
    },
    dodge: {
      base: {
        value: 0
      },
      final: {
        value: 0
      }
    },
    wearArmor: {
      value: 0
    },
    totalArmor: {
      at: {
        cut: {
          value: 0
        },
        impact: {
          value: 0
        },
        thrust: {
          value: 0
        },
        heat: {
          value: 0
        },
        electricity: {
          value: 0
        },
        cold: {
          value: 0
        },
        energy: {
          value: 0
        }
      }
    },
    combatSpecialSkills: [],
    combatTables: [],
    ammo: [],
    weapons: [],
    armors: []
  },

  mystic: {
    act: {
      main: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      alternative: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      }
    },
    zeon: {
      accumulated: 0,
      value: 0,
      max: 0
    },
    zeonRegeneration: {
      base: {
        value: 0
      },
      final: {
        value: 0
      }
    },
    innateMagic: {
      main: {
        value: 0
      },
      alternative: {
        value: 0
      }
    },
    magicProjection: {
      base: {
        value: 0
      },
      final: {
        value: 0
      },
      imbalance: {
        offensive: {
          base: {
            value: 0
          },
          final: {
            value: 0
          }
        },
        defensive: {
          base: {
            value: 0
          },
          final: {
            value: 0
          }
        }
      }
    },
    magicLevel: {
      spheres: {
        essence: {
          value: 0
        },
        water: {
          value: 0
        },
        earth: {
          value: 0
        },
        creation: {
          value: 0
        },
        darkness: {
          value: 0
        },
        necromancy: {
          value: 0
        },
        light: {
          value: 0
        },
        destruction: {
          value: 0
        },
        air: {
          value: 0
        },
        fire: {
          value: 0
        },
        illusion: {
          value: 0
        }
      },
      total: {
        value: 0
      },
      used: {
        value: 0
      }
    },
    summoning: {
      summon: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      banish: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      bind: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      control: {
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      }
    },
    spells: [],
    spellMaintenances: [],
    selectedSpells: [],
    summons: [],
    metamagics: []
  },

  domine: {
    kiSkills: [],
    nemesisSkills: [],
    arsMagnus: [],
    martialArts: [],
    creatures: [],
    specialSkills: [],
    techniques: [],
    seals: {
      minor: {
        earth: {
          isActive: false
        },
        metal: {
          isActive: false
        },
        wind: {
          isActive: false
        },
        water: {
          isActive: false
        },
        wood: {
          isActive: false
        }
      },
      major: {
        earth: {
          isActive: false
        },
        metal: {
          isActive: false
        },
        wind: {
          isActive: false
        },
        water: {
          isActive: false
        },
        wood: {
          isActive: false
        }
      }
    },
    martialKnowledge: {
      used: {
        value: 0
      },
      max: {
        value: 0
      }
    },
    kiAccumulation: {
      strength: {
        accumulated: {
          value: 0
        },
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      agility: {
        accumulated: {
          value: 0
        },
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      dexterity: {
        accumulated: {
          value: 0
        },
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      constitution: {
        accumulated: {
          value: 0
        },
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      willPower: {
        accumulated: {
          value: 0
        },
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      power: {
        accumulated: {
          value: 0
        },
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      generic: {
        value: 0,
        max: 0
      }
    }
  },

  psychic: {
    psychicPotential: {
      base: {
        value: 0
      },
      final: {
        value: 0
      }
    },
    psychicProjection: {
      base: {
        value: 0
      },
      final: {
        value: 0
      }
    },
    psychicPoints: {
      value: 0,
      max: 0
    },
    psychicPowers: [],
    psychicDisciplines: [],
    mentalPatterns: [],
    innatePsychicPower: {
      amount: {
        value: 0
      }
    },
    innatePsychicPowers: []
  }
};
