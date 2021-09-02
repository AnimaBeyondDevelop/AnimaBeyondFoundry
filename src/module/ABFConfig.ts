import { ManageabilityType, ShotType } from './types/combat/WeaponItemConfig';

export const ABFConfig: Record<string, any> = {};

ABFConfig.iterables = {
  combat: {
    weapon: {
      manageabilityTypes: {
        [ManageabilityType.ONE_HAND]: 'anima.ui.combat.weapon.manageabilityType.oneHand.title',
        [ManageabilityType.TWO_HAND]: 'anima.ui.combat.weapon.manageabilityType.twoHand.title',
        [ManageabilityType.ONE_OR_TWO_HAND]: 'anima.ui.combat.weapon.manageabilityType.oneOrTwoHand.title'
      },
      shotTypes: {
        [ShotType.SHOT]: 'anima.ui.combat.weapon.shotType.shot.title',
        [ShotType.THROW]: 'anima.ui.combat.weapon.shotType.throw.title'
      }
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
    spellTypes: {
      attack: 'anima.ui.mystic.spell.spellType.attack.title',
      defense: 'anima.ui.mystic.spell.spellType.defense.title',
      animatic: 'anima.ui.mystic.spell.spellType.animatic.title',
      effect: 'anima.ui.mystic.spell.spellType.effect.title',
      automatic: 'anima.ui.mystic.spell.spellType.automatic.title',
      detection: 'anima.ui.mystic.spell.spellType.detection.title'
    }
  }
};
