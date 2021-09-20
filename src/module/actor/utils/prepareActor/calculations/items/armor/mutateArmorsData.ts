import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { ArmorDataSource, INITIAL_ARMOR_DATA } from '../../../../../../types/combat/ArmorItemConfig';
import { calculateArmorIntegrity } from './calculations/calculateArmorIntegrity';
import { calculateArmorPresence } from './calculations/calculateArmorPresence';
import { calculateArmorTA } from './calculations/calculateArmorTA';
import { calculateArmorMovementRestriction } from './calculations/calculateArmorMovementRestriction';
import { calculateArmorNaturalPenalty } from './calculations/calculateArmorNaturalPenalty';
import { calculateArmorWearArmorRequirement } from './calculations/calculateArmorWearArmorRequirement';

export const mutateArmorsData = (data: ABFActorDataSourceData) => {
  const combat = data.combat as { armors: ArmorDataSource[] };

  combat.armors = combat.armors
    .map(armor => {
      armor.data = foundry.utils.mergeObject(armor.data, INITIAL_ARMOR_DATA, { overwrite: false });
      return armor;
    })
    .map(armor => {
      armor.data.cut.final.value = calculateArmorTA(armor, armor.data.cut.base.value);
      armor.data.cold.final.value = calculateArmorTA(armor, armor.data.cold.base.value);
      armor.data.heat.final.value = calculateArmorTA(armor, armor.data.heat.base.value);
      armor.data.electricity.final.value = calculateArmorTA(armor, armor.data.electricity.base.value);
      armor.data.impact.final.value = calculateArmorTA(armor, armor.data.impact.base.value);
      armor.data.thrust.final.value = calculateArmorTA(armor, armor.data.thrust.base.value);

      if (armor.data.isEnchanted.value) {
        armor.data.energy.final.value = calculateArmorTA(armor, armor.data.energy.base.value);
      } else {
        armor.data.energy.final.value = armor.data.energy.base.value;
      }

      armor.data.integrity.final.value = calculateArmorIntegrity(armor);
      armor.data.presence.final.value = calculateArmorPresence(armor);
      armor.data.movementRestriction.final.value = calculateArmorMovementRestriction(armor);
      armor.data.naturalPenalty.final.value = calculateArmorNaturalPenalty(armor);
      armor.data.wearArmorRequirement.final.value = calculateArmorWearArmorRequirement(armor);

      return armor;
    });
};
