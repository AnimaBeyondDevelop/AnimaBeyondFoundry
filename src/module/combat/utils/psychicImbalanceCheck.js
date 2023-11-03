export const psychicImbalanceCheck = (data, power) => {
  const { mentalPatterns, psychicDisciplines } = data.psychic;
  const powerDiscipline = power?.system.discipline.value;
  const regExpMental = new RegExp('Valentía');
  let extraLevels = 0;
  if (psychicDisciplines.find(i => i.name == powerDiscipline)?.system.imbalance) {
    extraLevels++;
  }
  if (
    power?.system.combatType.value == 'attack' &&
    regExpMental.test(mentalPatterns?.map(i => i.name))
  ) {
    extraLevels++;
  }
  return extraLevels;
};
