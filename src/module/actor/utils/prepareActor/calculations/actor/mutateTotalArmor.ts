import { ABFActorDataSourceData } from '../../../../../types/Actor';
import { ArmorLocation } from '../../../../../types/combat/ArmorItemConfig';
import { ArmorDataSource } from '../../../../../types/Items';

const calculateTA = (tas: number[]): number => {
  if (tas.length === 0) return 0;

  const orderedTas = new Int8Array([...tas]).sort().reverse();

  const maxTa = orderedTas[0];

  const sumOtherTas = orderedTas.slice(1).reduce((prev, curr) => prev + curr, 0);

  return maxTa! + Math.floor(sumOtherTas / 2);
};

export const mutateTotalArmor = (data: ABFActorDataSourceData) => {
  const totalArmor: ABFActorDataSourceData['combat']['totalArmor'] = {
    at: {
      cold: { value: 0 },
      cut: { value: 0 },
      electricity: { value: 0 },
      energy: { value: 0 },
      heat: { value: 0 },
      impact: { value: 0 },
      thrust: { value: 0 }
    }
  };

  const equippedArmors = (data.combat.armors as ArmorDataSource[]).filter(
    armor => armor.system.equipped.value && armor.system.localization.value !== ArmorLocation.HEAD
  );

  if (equippedArmors.length > 0) {
    totalArmor.at.cold.value = calculateTA(equippedArmors.map(armor => armor.system.cold.final.value));
    totalArmor.at.cut.value = calculateTA(equippedArmors.map(armor => armor.system.cut.final.value));
    totalArmor.at.electricity.value = calculateTA(equippedArmors.map(armor => armor.system.electricity.final.value));
    totalArmor.at.energy.value = calculateTA(equippedArmors.map(armor => armor.system.energy.final.value));
    totalArmor.at.heat.value = calculateTA(equippedArmors.map(armor => armor.system.heat.final.value));
    totalArmor.at.impact.value = calculateTA(equippedArmors.map(armor => armor.system.impact.final.value));
    totalArmor.at.thrust.value = calculateTA(equippedArmors.map(armor => armor.system.thrust.final.value));
  }

  let extraAt= data.combat.extraArmor.value;
    data.combat.totalArmor.at.cold.final.value = data.combat.totalArmor.at.cold.special.value + totalArmor.at.cold.value + extraAt;
    data.combat.totalArmor.at.cut.final.value = data.combat.totalArmor.at.cut.special.value + totalArmor.at.cut.value + extraAt;
    data.combat.totalArmor.at.electricity.final.value = data.combat.totalArmor.at.electricity.special.value + totalArmor.at.electricity.value + extraAt;
    data.combat.totalArmor.at.energy.final.value = data.combat.totalArmor.at.energy.special.value + totalArmor.at.energy.value + extraAt;
    data.combat.totalArmor.at.heat.final.value = data.combat.totalArmor.at.heat.special.value + totalArmor.at.heat.value + extraAt;
    data.combat.totalArmor.at.impact.final.value = data.combat.totalArmor.at.impact.special.value + totalArmor.at.impact.value + extraAt;
    data.combat.totalArmor.at.thrust.final.value = data.combat.totalArmor.at.thrust.special.value + totalArmor.at.thrust.value + extraAt;
};
