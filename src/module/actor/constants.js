export const INITIAL_ACTOR_DATA = {
  version: 1,
  ui: {
    contractibleItems: {},
    tabVisibility: {
      mystic: {
        value: false
      },
      domine: {
        value: false
      },
      psychic: {
        value: false
      }
    }
  },
  automationOptions: {
    calculateFatigueModifier: { value: true }
  },
  general: {
    settings: {
      openRolls: { value: 90 },
      fumbles: { value: 3 },
      openOnDoubles: { value: false },
      perceiveMystic: { value: false },
      inmaterial: { value: false },
      inhuman: { value: false },
      zen: { value: false },
      perceivePsychic: { value: false },
      defenseType: { value: '' }
    },
    modifiers: {
      physicalActions: {
        base: {
          value: 0
        },
        special: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      allActions: {
        base: {
          value: 0
        },
        special: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      naturalPenalty: {
        base: {
          value: 0
        },
        unreduced: {
          value: 0
        },
        reduction: {
          value: 0
        },
        special: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      perceptionPenalty: {
        base: {
          value: 0
        },
        special: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      extraDamage: {
        value: 0
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
      ethnicity: {
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
        },
        applyStatBonus: false
      },
      fatigue: {
        value: 0,
        max: 0
      },
      regenerationType: {
        mod: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      regeneration: {
        normal: {
          value: 0,
          period: ''
        },
        resting: {
          value: 0,
          period: ''
        },
        recovery: {
          value: 0,
          period: ''
        }
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
        },
        attribute: {
          value: 'agility'
        }
      },
      athleticism: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'agility'
        }
      },
      ride: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'agility'
        }
      },
      swim: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'agility'
        }
      },
      climb: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'agility'
        }
      },
      jump: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'strength'
        }
      },
      piloting: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'dexterity'
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
        },
        attribute: {
          value: 'willPower'
        }
      },
      featsOfStrength: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'strength'
        }
      },
      withstandPain: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'willPower'
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
        },
        attribute: {
          value: 'perception'
        }
      },
      search: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'perception'
        }
      },
      track: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'perception'
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
        },
        attribute: {
          value: 'intelligence'
        }
      },
      science: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
        }
      },
      law: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
        }
      },
      herbalLore: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
        }
      },
      history: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
        }
      },
      tactics: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'agiliintelligencety'
        }
      },
      medicine: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
        }
      },
      memorize: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
        }
      },
      navigation: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
        }
      },
      occult: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
        }
      },
      appraisal: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
        }
      },
      magicAppraisal: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'power'
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
        },
        attribute: {
          value: 'power'
        }
      },
      intimidate: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'willPower'
        }
      },
      leadership: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'power'
        }
      },
      persuasion: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
        }
      },
      trading: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
        }
      },
      streetwise: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
        }
      },
      etiquette: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
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
        },
        attribute: {
          value: 'dexterity'
        }
      },
      disguise: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'dexterity'
        }
      },
      hide: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'perception'
        }
      },
      theft: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'dexterity'
        }
      },
      stealth: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'agility'
        }
      },
      trapLore: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'dexterity'
        }
      },
      poisons: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
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
        },
        attribute: {
          value: 'power'
        }
      },
      dance: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'agility'
        }
      },
      forging: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'dexterity'
        }
      },
      runes: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'dexterity'
        }
      },
      alchemy: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'intelligence'
        }
      },
      animism: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'power'
        }
      },
      music: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'power'
        }
      },
      sleightOfHand: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'dexterity'
        }
      },
      ritualCalligraphy: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'dexterity'
        }
      },
      jewelry: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'dexterity'
        }
      },
      tailoring: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'dexterity'
        }
      },
      puppetMaking: {
        base: {
          value: 0
        },
        final: {
          value: 0
        },
        attribute: {
          value: 'power'
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
      },
      applyStatBonus: false
    },
    block: {
      base: {
        value: 0
      },
      final: {
        value: 0
      },
      applyStatBonus: false
    },
    dodge: {
      base: {
        value: 0
      },
      final: {
        value: 0
      },
      applyStatBonus: false
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
    armors: [],
    supernaturalShields: []
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
      via: []
    },
    zeon: {
      accumulated: 0,
      value: 0,
      max: 0
    },
    zeonMaintained: {
      value: 0
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
        base: {
          value: 0
        },
        final: {
          value: 0
        }
      },
      via: []
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
    mysticSettings: { aptitudeForMagicDevelopment: false },
    spells: [],
    spellMaintenances: [],
    selectedSpells: [],
    summons: [],
    metamagics: [],
    preparedSpells: []
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
    psychicPoints: {
      value: 0,
      max: 0
    },
    psychicSettings: {
      fatigueResistance: false
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
