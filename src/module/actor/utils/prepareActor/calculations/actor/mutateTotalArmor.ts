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
  const totalArmor: ABFActorDataSourceData['combat']['totalArmor'] = data.combat.totalArmor;

  const equippedArmors = (data.combat.armors as ArmorDataSource[]).filter(
    armor => armor.system.equipped.value && armor.system.localization.value !== ArmorLocation.HEAD
  );

  if (equippedArmors.length > 0) {
    totalArmor.at.cold.final.value = calculateTA(equippedArmors.map(armor => armor.system.cold.final.value));
    totalArmor.at.cut.final.value = calculateTA(equippedArmors.map(armor => armor.system.cut.final.value));
    totalArmor.at.electricity.final.value = calculateTA(equippedArmors.map(armor => armor.system.electricity.final.value));
    totalArmor.at.energy.final.value = calculateTA(equippedArmors.map(armor => armor.system.energy.final.value));
    totalArmor.at.heat.final.value = calculateTA(equippedArmors.map(armor => armor.system.heat.final.value));
    totalArmor.at.impact.final.value = calculateTA(equippedArmors.map(armor => armor.system.impact.final.value));
    totalArmor.at.thrust.final.value = calculateTA(equippedArmors.map(armor => armor.system.thrust.final.value));
  }

  totalArmor.at.cold.final.value += data.combat.totalArmor.at.cold.special.value;
  totalArmor.at.cut.final.value += data.combat.totalArmor.at.cut.special.value;
  totalArmor.at.electricity.final.value += data.combat.totalArmor.at.electricity.special.value;
  totalArmor.at.energy.final.value += data.combat.totalArmor.at.energy.special.value;
  totalArmor.at.heat.final.value += data.combat.totalArmor.at.heat.special.value;
  totalArmor.at.impact.final.value += data.combat.totalArmor.at.impact.special.value;
  totalArmor.at.thrust.final.value += data.combat.totalArmor.at.thrust.special.value;

  data.combat.totalArmor = totalArmor;
};
