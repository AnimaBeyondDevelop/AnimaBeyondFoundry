import { ABFActorDataSourceData } from '../../../../../types/Actor';
import { ArmorDataSource, ArmorLocation } from '../../../../../types/combat/ArmorItemConfig';

const calculateTA = (tas: number[]): number => {
  if (tas.length === 0) return 0;

  const orderedTas = [...tas].sort().reverse();

  const maxTa = orderedTas.shift();

  const sumOtherTas = orderedTas.reduce((prev, curr) => prev + curr, 0);

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
    armor => armor.data.equipped.value && armor.data.localization.value !== ArmorLocation.HEAD
  );

  if (equippedArmors.length > 0) {
    totalArmor.at.cold.value = calculateTA(equippedArmors.map(armor => armor.data.cold.final.value));
    totalArmor.at.cut.value = calculateTA(equippedArmors.map(armor => armor.data.cut.final.value));
    totalArmor.at.electricity.value = calculateTA(equippedArmors.map(armor => armor.data.electricity.final.value));
    totalArmor.at.energy.value = calculateTA(equippedArmors.map(armor => armor.data.energy.final.value));
    totalArmor.at.heat.value = calculateTA(equippedArmors.map(armor => armor.data.heat.final.value));
    totalArmor.at.impact.value = calculateTA(equippedArmors.map(armor => armor.data.impact.final.value));
    totalArmor.at.thrust.value = calculateTA(equippedArmors.map(armor => armor.data.thrust.final.value));
  }

  data.combat.totalArmor = totalArmor;
};
