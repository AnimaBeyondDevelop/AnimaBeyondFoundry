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
      },
      effects: {
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
    diceSettings: {
      characteristicDie: { value: '1d10ControlRoll' },
      initiativeDie: { value: '1d100Initiative' },
      resistanceDie: { value: '1d100' },
      abilityDie: { value: '1d100xa' },
      abilityMasteryDie: { value: '1d100xamastery' }
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
        __type: '{"type":"NumericalValue"}'
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
    level: { value: 0 },
    notes: [],
    titles: []
  },

  characteristics: {
    primaries: {
      agility: {
        __type: '{"type":"Characteristic"}'
      },
      constitution: {
        __type: '{"type":"Characteristic"}'
      },
      dexterity: {
        __type: '{"type":"Characteristic"}'
      },
      strength: {
        __type: '{"type":"Characteristic"}'
      },
      intelligence: {
        __type: '{"type":"Characteristic"}'
      },
      perception: {
        __type: '{"type":"Characteristic"}'
      },
      power: {
        __type: '{"type":"Characteristic"}'
      },
      willPower: {
        __type: '{"type":"Characteristic"}'
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
        special: {
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
          special: {
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
          special: {
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
          special: {
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
          special: {
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
          special: {
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
        __type:
          '{"type":"SecondaryAbility","attribute":"agility","applyNaturalPenalty":"true"}'
      },
      athleticism: {
        __type:
          '{"type":"SecondaryAbility","attribute":"agility","applyNaturalPenalty":"true"}'
      },
      ride: { __type: '{"type":"SecondaryAbility","attribute":"agility"}' },
      swim: {
        __type:
          '{"type":"SecondaryAbility","attribute":"agility","applyNaturalPenalty":"true","maxNaturalPenaltyReductionPercentage":"0"}'
      },
      climb: {
        __type:
          '{"type":"SecondaryAbility","attribute":"agility","applyNaturalPenalty":"true"}'
      },
      jump: {
        __type:
          '{"type":"SecondaryAbility","attribute":"strength","applyNaturalPenalty":"true"}'
      },
      piloting: { __type: '{"type":"SecondaryAbility","attribute":"dexterity"}' }
    },

    vigor: {
      composure: { __type: '{"type":"SecondaryAbility","attribute":"willPower"}' },
      featsOfStrength: {
        __type:
          '{"type":"SecondaryAbility","attribute":"strength","applyNaturalPenalty":"true"}'
      },
      withstandPain: { __type: '{"type":"SecondaryAbility","attribute":"willPower"}' }
    },

    perception: {
      notice: {
        __type:
          '{"type":"SecondaryAbility","attribute":"perception","applyPerceptionPenalty":"true"}'
      },
      search: {
        __type:
          '{"type":"SecondaryAbility","attribute":"perception","applyPerceptionPenalty":"true"}'
      },
      track: { __type: '{"type":"SecondaryAbility","attribute":"perception"}' }
    },

    intellectual: {
      animals: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      science: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      law: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      herbalLore: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      history: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      tactics: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      medicine: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      memorize: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      navigation: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      occult: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      appraisal: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      magicAppraisal: { __type: '{"type":"SecondaryAbility","attribute":"power"}' }
    },

    social: {
      style: { __type: '{"type":"SecondaryAbility","attribute":"power"}' },
      intimidate: { __type: '{"type":"SecondaryAbility","attribute":"willPower"}' },
      leadership: { __type: '{"type":"SecondaryAbility","attribute":"power"}' },
      persuasion: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      trading: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      streetwise: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      etiquette: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' }
    },

    subterfuge: {
      lockPicking: { __type: '{"type":"SecondaryAbility","attribute":"dexterity"}' },
      disguise: { __type: '{"type":"SecondaryAbility","attribute":"dexterity"}' },
      hide: {
        __type:
          '{"type":"SecondaryAbility","attribute":"perception","applyNaturalPenalty":"true"}'
      },
      theft: { __type: '{"type":"SecondaryAbility","attribute":"dexterity"}' },
      stealth: {
        __type:
          '{"type":"SecondaryAbility","attribute":"agility","applyNaturalPenalty":"true","maxNaturalPenaltyReductionPercentage":"50"}'
      },
      trapLore: { __type: '{"type":"SecondaryAbility","attribute":"dexterity"}' },
      poisons: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' }
    },

    creative: {
      art: { __type: '{"type":"SecondaryAbility","attribute":"power"}' },
      dance: {
        __type:
          '{"type":"SecondaryAbility","attribute":"agility","applyNaturalPenalty":"true"}'
      },
      forging: { __type: '{"type":"SecondaryAbility","attribute":"dexterity"}' },
      runes: { __type: '{"type":"SecondaryAbility","attribute":"dexterity"}' },
      alchemy: { __type: '{"type":"SecondaryAbility","attribute":"intelligence"}' },
      animism: { __type: '{"type":"SecondaryAbility","attribute":"power"}' },
      music: { __type: '{"type":"SecondaryAbility","attribute":"power"}' },
      sleightOfHand: { __type: '{"type":"SecondaryAbility","attribute":"dexterity"}' },
      ritualCalligraphy: {
        __type: '{"type":"SecondaryAbility","attribute":"dexterity"}'
      },
      jewelry: { __type: '{"type":"SecondaryAbility","attribute":"dexterity"}' },
      tailoring: { __type: '{"type":"SecondaryAbility","attribute":"dexterity"}' },
      puppetMaking: { __type: '{"type":"SecondaryAbility","attribute":"power"}' }
    },

    secondarySpecialSkills: []
  },

  combat: {
    attack: {
      __type: '{"type":"Ability", "attribute":"dexterity"}'
    },
    block: {
      __type: '{"type":"Ability", "attribute":"dexterity"}'
    },
    dodge: {
      __type: '{"type":"Ability", "attribute":"agility"}'
    },
    wearArmor: {
      __type: '{"type":"AffectedByCharacteristicValue", "attribute":"strength"}'
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
    supernaturalShields: [],
    damageReduction: {
      __type: '{"type":"NumericalValue"}'
    }
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
        fire: {
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
        fire: {
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
