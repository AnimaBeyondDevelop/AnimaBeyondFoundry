import { ABFActorDataSourceData } from '../../../../../types/Actor';
import { ArmorDataSource, ArmorLocation } from '../../../../../types/combat/ArmorItemConfig';

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

  data.combat.totalArmor = totalArmor;
};
