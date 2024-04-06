import {
  WeaponManageabilityType,
  NoneWeaponCritic,
  WeaponShotType,
  WeaponCritic,
  WeaponSizeProportion,
  WeaponSize,
  Attribute,
  NoneAttribute,
  BaseDamageCalculationType
} from './types/combat/WeaponItemConfig';
import {
  PsychicPowerActionTypes,
  PsychicPowerDisciplines,
  PsychicPowerCombatTypes
} from './types/psychic/PsychicPowerItemConfig.js';
import { SpellGrades } from './types/mystic/SpellItemConfig';
import { Effects, Activation, Duration, Transmission } from './types/combat/PoisonItemConfig';

export const ABFConfig: Record<string, any> = {};

const criticTypes = {
  [WeaponCritic.CUT]: 'anima.ui.combat.armors.at.cut.title',
  [WeaponCritic.IMPACT]: 'anima.ui.combat.armors.at.impact.title',
  [WeaponCritic.THRUST]: 'anima.ui.combat.armors.at.thrust.title',
  [WeaponCritic.HEAT]: 'anima.ui.combat.armors.at.heat.title',
  [WeaponCritic.ELECTRICITY]: 'anima.ui.combat.armors.at.electricity.title',
  [WeaponCritic.COLD]: 'anima.ui.combat.armors.at.cold.title',
  [WeaponCritic.ENERGY]: 'anima.ui.combat.armors.at.energy.title'
};

const attributes = {
  [Attribute.AGI]: 'anima.ui.characteristics.agility.title',
  [Attribute.CON]: 'anima.ui.characteristics.constitution.title',
  [Attribute.DEX]: 'anima.ui.characteristics.dexterity.title',
  [Attribute.STR]: 'anima.ui.characteristics.strength.title',
  [Attribute.INT]: 'anima.ui.characteristics.intelligence.title',
  [Attribute.PER]: 'anima.ui.characteristics.perception.title',
  [Attribute.POW]: 'anima.ui.characteristics.power.title',
  [Attribute.WP]: 'anima.ui.characteristics.willPower.title'
};

ABFConfig.ui = {};

ABFConfig.iterables = {
  general: {
    attributes,
    attributesWithNone: {
      [NoneAttribute.NONE]: 'anima.ui.characteristics.none.title',
      ...attributes
    }
  },
  combat: {
    weapon: {
      sizes: {
        [WeaponSize.SMALL]: 'anima.ui.combat.weapon.size.small.title',
        [WeaponSize.MEDIUM]: 'anima.ui.combat.weapon.size.medium.title',
        [WeaponSize.BIG]: 'anima.ui.combat.weapon.size.big.title'
      },
      sizeProportions: {
        [WeaponSizeProportion.NORMAL]:
          'anima.ui.combat.weapon.sizeProportion.normal.title',
        [WeaponSizeProportion.ENORMOUS]:
          'anima.ui.combat.weapon.sizeProportion.enormous.title',
        [WeaponSizeProportion.GIANT]: 'anima.ui.combat.weapon.sizeProportion.giant.title'
      },
      criticTypes,
      criticTypesWithNone: {
        [NoneWeaponCritic.NONE]: 'anima.ui.combat.armors.at.none.title',
        ...criticTypes
      },
      manageabilityTypes: {
        [WeaponManageabilityType.ONE_HAND]:
          'anima.ui.combat.weapon.manageabilityType.oneHand.title',
        [WeaponManageabilityType.TWO_HAND]:
          'anima.ui.combat.weapon.manageabilityType.twoHand.title',
        [WeaponManageabilityType.ONE_OR_TWO_HAND]:
          'anima.ui.combat.weapon.manageabilityType.oneOrTwoHand.title'
      },
      shotTypes: {
        [WeaponShotType.SHOT]: 'anima.ui.combat.weapon.shotType.shot.title',
        [WeaponShotType.THROW]: 'anima.ui.combat.weapon.shotType.throw.title'
      },
      baseDamageCalculationTypes: {
        [BaseDamageCalculationType.DEFAULT]: 'anima.ui.combat.weapon.baseDamageCalculationType.default.title',
        [BaseDamageCalculationType.PRESENCE]: 'anima.ui.combat.weapon.baseDamageCalculationType.presence.title',
        [BaseDamageCalculationType.DOUBLE_PRESENCE]: 'anima.ui.combat.weapon.baseDamageCalculationType.doublePresence.title',
      }
    },
    poison: {
      effects: {
        [Effects.NONE]: 'anima.ui.combat.poison.effects.none.title',
        [Effects.BLINDNESS]: 'anima.ui.combat.poison.effects.blindness.title',
        [Effects.DAMAGE]: 'anima.ui.combat.poison.effects.damage.title',
        [Effects.DEATH]: 'anima.ui.combat.poison.effects.death.title',
        [Effects.HALLUCINATIONS]: 'anima.ui.combat.poison.effects.hallucinations.title',
        [Effects.PAIN]: 'anima.ui.combat.poison.effects.pain.title',
        [Effects.PARALYSIS]: 'anima.ui.combat.poison.effects.paralysis.title',
        [Effects.PENALTY]: 'anima.ui.combat.poison.effects.penalty.title',
        [Effects.RAGE]: 'anima.ui.combat.poison.effects.rage.title',
        [Effects.TERROR]: 'anima.ui.combat.poison.effects.terror.title',
        [Effects.UNCONSCIOUSNESS]: 'anima.ui.combat.poison.effects.unconsciousness.title',
        [Effects.WEAKNESS]: 'anima.ui.combat.poison.effects.weakness.title',
      },
      activation: {
        [Activation.NORMAL]: 'anima.ui.combat.poison.activation.normal.title',
        [Activation.QUICK]: 'anima.ui.combat.poison.activation.quick.title',
        [Activation.INSTANTANEOUS]: 'anima.ui.combat.poison.activation.instantaneous.title'
      },
      duration: {
        [Duration.NORMAL]: 'anima.ui.combat.poison.duration.normal.title',
        [Duration.LONG]: 'anima.ui.combat.poison.duration.long.title'
      },
      transmission: {
        [Transmission.BLOOD]: 'anima.ui.combat.poison.transmission.blood.title',
        [Transmission.INGESTION]: 'anima.ui.combat.poison.transmission.ingestion.title',
        [Transmission.CONTACT]: 'anima.ui.combat.poison.transmission.contact.title',
        [Transmission.INHALING]: 'anima.ui.combat.poison.transmission.inhaling.title'
      },
    }
  },
  mystic: {
    vias: {
      air: 'anima.ui.mystic.spell.via.air.title',
      blood: 'anima.ui.mystic.spell.via.blood.title',
      chaos: 'anima.ui.mystic.spell.via.chaos.title',
      creation: 'anima.ui.mystic.spell.via.creation.title',
      darkness: 'anima.ui.mystic.spell.via.darkness.title',
      death: 'anima.ui.mystic.spell.via.death.title',
      destruction: 'anima.ui.mystic.spell.via.destruction.title',
      dreams: 'anima.ui.mystic.spell.via.dreams.title',
      earth: 'anima.ui.mystic.spell.via.earth.title',
      emptiness: 'anima.ui.mystic.spell.via.emptiness.title',
      essence: 'anima.ui.mystic.spell.via.essence.title',
      fire: 'anima.ui.mystic.spell.via.fire.title',
      freeAccess: 'anima.ui.mystic.spell.via.freeAccess.title',
      illusion: 'anima.ui.mystic.spell.via.illusion.title',
      knowledge: 'anima.ui.mystic.spell.via.knowledge.title',
      light: 'anima.ui.mystic.spell.via.light.title',
      literae: 'anima.ui.mystic.spell.via.literae.title',
      musical: 'anima.ui.mystic.spell.via.musical.title',
      necromancy: 'anima.ui.mystic.spell.via.necromancy.title',
      nobility: 'anima.ui.mystic.spell.via.nobility.title',
      peace: 'anima.ui.mystic.spell.via.peace.title',
      sin: 'anima.ui.mystic.spell.via.sin.title',
      threshold: 'anima.ui.mystic.spell.via.threshold.title',
      time: 'anima.ui.mystic.spell.via.time.title',
      war: 'anima.ui.mystic.spell.via.war.title',
      water: 'anima.ui.mystic.spell.via.water.title'
    },
    actionTypes: {
      active: 'anima.ui.mystic.spell.actionType.active.title',
      passive: 'anima.ui.mystic.spell.actionType.passive.title'
    },
    combatTypes: {
      attack: 'anima.ui.mystic.spell.combatType.attack.title',
      defense: 'anima.ui.mystic.spell.combatType.defense.title',
      none: 'anima.ui.mystic.spell.combatType.none.title'
    },
    spellTypes: {
      attack: 'anima.ui.mystic.spell.spellType.attack.title',
      defense: 'anima.ui.mystic.spell.spellType.defense.title',
      animatic: 'anima.ui.mystic.spell.spellType.animatic.title',
      effect: 'anima.ui.mystic.spell.spellType.effect.title',
      automatic: 'anima.ui.mystic.spell.spellType.automatic.title',
      detection: 'anima.ui.mystic.spell.spellType.detection.title'
    },
    spellGrades: {
      [SpellGrades.BASE]: 'anima.ui.mystic.spell.grade.base.title',
      [SpellGrades.INTERMEDIATE]: 'anima.ui.mystic.spell.grade.intermediate.title',
      [SpellGrades.ADVANCED]: 'anima.ui.mystic.spell.grade.advanced.title',
      [SpellGrades.ARCANE]: 'anima.ui.mystic.spell.grade.arcane.title'
    }
  },
  psychic: {
    actionTypes: {
      [PsychicPowerActionTypes.ACTIVE]:
        'anima.ui.psychic.psychicPowers.actionType.active.title',
      [PsychicPowerActionTypes.PASSIVE]:
        'anima.ui.psychic.psychicPowers.actionType.passive.title'
    },
    combatTypes: {
      [PsychicPowerCombatTypes.ATTACK]:
        'anima.ui.psychic.psychicPowers.combatType.attack.title',
      [PsychicPowerCombatTypes.DEFENSE]:
        'anima.ui.psychic.psychicPowers.combatType.defense.title',
      [PsychicPowerCombatTypes.NONE]:
        'anima.ui.psychic.psychicPowers.combatType.none.title'
    },
    disciplines: {
      [PsychicPowerDisciplines.MATRIX_POWERS]:
        'anima.ui.psychic.psychicPowers.discipline.matrixPowers.title',
      [PsychicPowerDisciplines.TELEPATHY]:
        'anima.ui.psychic.psychicPowers.discipline.telepathy.title',
      [PsychicPowerDisciplines.TELEKINESIS]:
        'anima.ui.psychic.psychicPowers.discipline.telekenisis.title',
      [PsychicPowerDisciplines.PYROKINESIS]:
        'anima.ui.psychic.psychicPowers.discipline.pyrokinesis.title',
      [PsychicPowerDisciplines.CRYOKINESIS]:
        'anima.ui.psychic.psychicPowers.discipline.cryokinesis.title',
      [PsychicPowerDisciplines.PHYSICAL_INCREASE]:
        'anima.ui.psychic.psychicPowers.discipline.physicalIncrease.title',
      [PsychicPowerDisciplines.ENERGY]:
        'anima.ui.psychic.psychicPowers.discipline.energy.title',
      [PsychicPowerDisciplines.TELEMETRY]:
        'anima.ui.psychic.psychicPowers.discipline.telemetry.title',
      [PsychicPowerDisciplines.SENTIENT]:
        'anima.ui.psychic.psychicPowers.discipline.sentient.title',
      [PsychicPowerDisciplines.CAUSALITY]:
        'anima.ui.psychic.psychicPowers.discipline.causality.title',
      [PsychicPowerDisciplines.ELECTROMAGNETISM]:
        'anima.ui.psychic.psychicPowers.discipline.electromagnetism.title',
      [PsychicPowerDisciplines.TELEPORTATION]:
        'anima.ui.psychic.psychicPowers.discipline.teleportation.title',
      [PsychicPowerDisciplines.LIGHT]:
        'anima.ui.psychic.psychicPowers.discipline.light.title',
      [PsychicPowerDisciplines.HYPERSENSITIVITY]:
        'anima.ui.psychic.psychicPowers.discipline.hypersensitivity.title'
    }
  }
};
