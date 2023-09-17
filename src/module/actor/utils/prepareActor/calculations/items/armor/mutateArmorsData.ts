import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { ArmorDataSource } from '../../../../../../types/Items';
import { calculateArmorIntegrity } from './calculations/calculateArmorIntegrity';
import { calculateArmorPresence } from './calculations/calculateArmorPresence';
import { calculateArmorTA } from './calculations/calculateArmorTA';
import { calculateArmorMovementRestriction } from './calculations/calculateArmorMovementRestriction';
import { calculateArmorNaturalPenalty } from './calculations/calculateArmorNaturalPenalty';
import { calculateArmorWearArmorRequirement } from './calculations/calculateArmorWearArmorRequirement';

export const mutateArmorsData = (data: ABFActorDataSourceData) => {
  const combat = data.combat as { armors: ArmorDataSource[] };

  combat.armors = combat.armors.map(armor => {
    armor.system.cut = {
      base: armor.system.cut.base,
      final: { value: calculateArmorTA(armor, armor.system.cut.base.value) }
    };

    armor.system.cold = {
      base: armor.system.cold.base,
      final: { value: calculateArmorTA(armor, armor.system.cold.base.value) }
    };

    armor.system.heat = {
      base: armor.system.heat.base,
      final: { value: calculateArmorTA(armor, armor.system.heat.base.value) }
    };

    armor.system.electricity = {
      base: armor.system.electricity.base,
      final: { value: calculateArmorTA(armor, armor.system.electricity.base.value) }
    };

    armor.system.impact = {
      base: armor.system.impact.base,
      final: { value: calculateArmorTA(armor, armor.system.impact.base.value) }
    };

    armor.system.thrust = {
      base: armor.system.thrust.base,
      final: { value: calculateArmorTA(armor, armor.system.thrust.base.value) }
    };

    if (armor.system.isEnchanted.value) {
      armor.system.energy = {
        base: armor.system.energy.base,
        final: { value: calculateArmorTA(armor, armor.system.energy.base.value) }
      };
    } else {
      armor.system.energy = {
        base: armor.system.energy.base,
        final: armor.system.energy.base
      };
    }

    armor.system.integrity = {
      base: armor.system.integrity.base,
      final: { value: calculateArmorIntegrity(armor) }
    };

    armor.system.presence = {
      base: armor.system.presence.base,
      final: { value: calculateArmorPresence(armor) }
    };

    armor.system.movementRestriction = {
      base: armor.system.movementRestriction.base,
      final: { value: calculateArmorMovementRestriction(armor) }
    };

    armor.system.naturalPenalty = {
      base: armor.system.naturalPenalty.base,
      final: { value: calculateArmorNaturalPenalty(armor) }
    };

    armor.system.wearArmorRequirement = {
      base: armor.system.wearArmorRequirement.base,
      final: { value: calculateArmorWearArmorRequirement(armor) }
    };

    return armor;
  });
};
