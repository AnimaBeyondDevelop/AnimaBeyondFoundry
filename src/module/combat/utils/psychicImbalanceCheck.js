export const psychicImbalanceCheck = (data, power) => {
  const { mentalPatterns, psychicDisciplines } = data.psychic;
  const powerDiscipline = power?.system.discipline.value;
  let extraLevels = 0;
  if (psychicDisciplines.find(i => i.name == powerDiscipline)?.system.imbalance) {
    extraLevels++;
  }
  if (
    power?.system.combatType.value == 'attack' &&
    mentalPatterns.find(i => i.name == 'courage')
  ) {
    extraLevels++;
  }
  return extraLevels;
};
