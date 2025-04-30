import {
  WeaponEquippedHandType,
  WeaponKnowledgeType,
  WeaponManageabilityType,
  WeaponShotType,
  WeaponSizeProportion,
  WeaponSize
} from '@module/data/items/enums/WeaponEnums';
import { NoneCriticType, CriticType } from '@module/data/items/enums/CriticEnums';
import { PsychicDiscipline } from '@module/data/items/enums/PsychicPowerEnums';
import { SpellGrade, SpellType, Via } from '@module/data/items/enums/SpellEnums';
import { ResistanceType } from '@module/data/items/enums/ResistanceTypeEnum';
import { CombatType, ActionType } from '@module/data/items/enums/CombatEnums';

const criticTypes = /** @type {const} */ ({
  [CriticType.CUT]: 'anima.ui.combat.armors.at.cut.title',
  [CriticType.IMPACT]: 'anima.ui.combat.armors.at.impact.title',
  [CriticType.THRUST]: 'anima.ui.combat.armors.at.thrust.title',
  [CriticType.HEAT]: 'anima.ui.combat.armors.at.heat.title',
  [CriticType.ELECTRICITY]: 'anima.ui.combat.armors.at.electricity.title',
  [CriticType.COLD]: 'anima.ui.combat.armors.at.cold.title',
  [CriticType.ENERGY]: 'anima.ui.combat.armors.at.energy.title'
});
export const ABFConfig = /** @type {const} */ ({
  ui: {},
  iterables: {
    combat: {
      criticTypes,
      criticTypesWithNone: {
        [NoneCriticType.NONE]: 'anima.ui.combat.armors.at.none.title',
        ...criticTypes
      },
      combatTypes: {
        //TODO: Create new localization for this
        [CombatType.ATTACK]: 'anima.ui.psychic.psychicPowers.combatType.attack.title',
        [CombatType.DEFENSE]: 'anima.ui.psychic.psychicPowers.combatType.defense.title',
        [CombatType.NONE]: 'anima.ui.psychic.psychicPowers.combatType.none.title'
      },
      //TODO: Create new localization for this
      actionTypes: {
        [ActionType.ACTIVE]: 'anima.ui.psychic.psychicPowers.actionType.active.title',
        [ActionType.PASSIVE]: 'anima.ui.psychic.psychicPowers.actionType.passive.title'
      },
      //TODO: Create new localization for this
      resistances: {
        [ResistanceType.PHYSICAL]: 'anima.ui.resistances.physical',
        [ResistanceType.DISEASE]: 'anima.ui.resistances.disease',
        [ResistanceType.POISON]: 'anima.ui.resistances.poison',
        [ResistanceType.MAGIC]: 'anima.ui.resistances.magic',
        [ResistanceType.PSYCHIC]: 'anima.ui.resistances.psychic',
        [ResistanceType.NONE]: 'anima.ui.resistances.none'
      },
      weapon: {
        equippedHandTypes: {
          [WeaponEquippedHandType.ONE_HANDED]: '',
          [WeaponEquippedHandType.TWO_HANDED]: ''
        },
        knowledgeTypes: {
          [WeaponKnowledgeType.KNOWN]: '',
          [WeaponKnowledgeType.SIMILAR]: '',
          [WeaponKnowledgeType.MIXED]: '',
          [WeaponKnowledgeType.DIFFERENT]: ''
        },
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
          [WeaponSizeProportion.GIANT]:
            'anima.ui.combat.weapon.sizeProportion.giant.title'
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
        }
      }
    },
    mystic: {
      vias: {
        [Via.AIR]: 'anima.ui.mystic.spell.via.air.title',
        [Via.BLOOD]: 'anima.ui.mystic.spell.via.blood.title',
        [Via.CHAOS]: 'anima.ui.mystic.spell.via.chaos.title',
        [Via.CREATION]: 'anima.ui.mystic.spell.via.creation.title',
        [Via.DARKNESS]: 'anima.ui.mystic.spell.via.darkness.title',
        [Via.DEATH]: 'anima.ui.mystic.spell.via.death.title',
        [Via.DESTRUCTION]: 'anima.ui.mystic.spell.via.destruction.title',
        [Via.DREAMS]: 'anima.ui.mystic.spell.via.dreams.title',
        [Via.EARTH]: 'anima.ui.mystic.spell.via.earth.title',
        [Via.EMPTINESS]: 'anima.ui.mystic.spell.via.emptiness.title',
        [Via.ESSENCE]: 'anima.ui.mystic.spell.via.essence.title',
        [Via.FIRE]: 'anima.ui.mystic.spell.via.fire.title',
        [Via.FREEACCESS]: 'anima.ui.mystic.spell.via.freeAccess.title',
        [Via.ILLUSION]: 'anima.ui.mystic.spell.via.illusion.title',
        [Via.KNOWLEDGE]: 'anima.ui.mystic.spell.via.knowledge.title',
        [Via.LIGHT]: 'anima.ui.mystic.spell.via.light.title',
        [Via.LITERAE]: 'anima.ui.mystic.spell.via.literae.title',
        [Via.MUSICAL]: 'anima.ui.mystic.spell.via.musical.title',
        [Via.NECROMANCY]: 'anima.ui.mystic.spell.via.necromancy.title',
        [Via.NOBILITY]: 'anima.ui.mystic.spell.via.nobility.title',
        [Via.PEACE]: 'anima.ui.mystic.spell.via.peace.title',
        [Via.SIN]: 'anima.ui.mystic.spell.via.sin.title',
        [Via.THRESHOLD]: 'anima.ui.mystic.spell.via.threshold.title',
        [Via.TIME]: 'anima.ui.mystic.spell.via.time.title',
        [Via.WAR]: 'anima.ui.mystic.spell.via.war.title',
        [Via.WATER]: 'anima.ui.mystic.spell.via.water.title'
      },
      //TODO: Delete this after changing all occurrences
      actionTypes: {
        [ActionType.ACTIVE]: 'anima.ui.mystic.spell.actionType.active.title',
        [ActionType.PASSIVE]: 'anima.ui.mystic.spell.actionType.passive.title'
      },
      //TODO: Delete this after changing all occurrences
      combatTypes: {
        [CombatType.ATTACK]: 'anima.ui.mystic.spell.combatType.attack.title',
        [CombatType.DEFENSE]: 'anima.ui.mystic.spell.combatType.defense.title',
        [CombatType.NONE]: 'anima.ui.mystic.spell.combatType.none.title'
      },
      spellTypes: {
        [SpellType.ATTACK]: 'anima.ui.mystic.spell.spellType.attack.title',
        [SpellType.DEFENSE]: 'anima.ui.mystic.spell.spellType.defense.title',
        [SpellType.ANIMATIC]: 'anima.ui.mystic.spell.spellType.animatic.title',
        [SpellType.EFFECT]: 'anima.ui.mystic.spell.spellType.effect.title',
        [SpellType.AUTOMATIC]: 'anima.ui.mystic.spell.spellType.automatic.title',
        [SpellType.DETECTION]: 'anima.ui.mystic.spell.spellType.detection.title'
      },
      spellGrades: {
        [SpellGrade.BASE]: 'anima.ui.mystic.spell.grade.base.title',
        [SpellGrade.INTERMEDIATE]: 'anima.ui.mystic.spell.grade.intermediate.title',
        [SpellGrade.ADVANCED]: 'anima.ui.mystic.spell.grade.advanced.title',
        [SpellGrade.ARCANE]: 'anima.ui.mystic.spell.grade.arcane.title'
      }
    },
    psychic: {
      //TODO: Delete this after changing all occurrences
      actionTypes: {
        [ActionType.ACTIVE]: 'anima.ui.psychic.psychicPowers.actionType.active.title',
        [ActionType.PASSIVE]: 'anima.ui.psychic.psychicPowers.actionType.passive.title'
      },
      //TODO: Delete this after changing all occurrences
      combatTypes: {
        [CombatType.ATTACK]: 'anima.ui.psychic.psychicPowers.combatType.attack.title',
        [CombatType.DEFENSE]: 'anima.ui.psychic.psychicPowers.combatType.defense.title',
        [CombatType.NONE]: 'anima.ui.psychic.psychicPowers.combatType.none.title'
      },
      disciplines: {
        [PsychicDiscipline.MATRIX_POWERS]:
          'anima.ui.psychic.psychicPowers.discipline.matrixPowers.title',
        [PsychicDiscipline.TELEPATHY]:
          'anima.ui.psychic.psychicPowers.discipline.telepathy.title',
        [PsychicDiscipline.TELEKINESIS]:
          'anima.ui.psychic.psychicPowers.discipline.telekenisis.title',
        [PsychicDiscipline.PYROKINESIS]:
          'anima.ui.psychic.psychicPowers.discipline.pyrokinesis.title',
        [PsychicDiscipline.CRYOKINESIS]:
          'anima.ui.psychic.psychicPowers.discipline.cryokinesis.title',
        [PsychicDiscipline.PHYSICAL_INCREASE]:
          'anima.ui.psychic.psychicPowers.discipline.physicalIncrease.title',
        [PsychicDiscipline.ENERGY]:
          'anima.ui.psychic.psychicPowers.discipline.energy.title',
        [PsychicDiscipline.TELEMETRY]:
          'anima.ui.psychic.psychicPowers.discipline.telemetry.title',
        [PsychicDiscipline.SENTIENT]:
          'anima.ui.psychic.psychicPowers.discipline.sentient.title',
        [PsychicDiscipline.CAUSALITY]:
          'anima.ui.psychic.psychicPowers.discipline.causality.title',
        [PsychicDiscipline.ELECTROMAGNETISM]:
          'anima.ui.psychic.psychicPowers.discipline.electromagnetism.title',
        [PsychicDiscipline.TELEPORTATION]:
          'anima.ui.psychic.psychicPowers.discipline.teleportation.title',
        [PsychicDiscipline.LIGHT]:
          'anima.ui.psychic.psychicPowers.discipline.light.title',
        [PsychicDiscipline.HYPERSENSITIVITY]:
          'anima.ui.psychic.psychicPowers.discipline.hypersensitivity.title'
      }
    }
  }
});
