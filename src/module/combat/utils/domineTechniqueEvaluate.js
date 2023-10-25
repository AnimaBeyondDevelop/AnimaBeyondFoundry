export const domineTechniqueEvaluate = (actor, technique) => {
  const kiChar = [
    'agility',
    'constitution',
    'dexterity',
    'power',
    'strength',
    'willPower'
  ];
  const { kiAccumulation } = actor.system.domine;
  const kiCost = {};
  const kiAcc = {};
  for (const key in technique.system) {
    if (kiChar.includes(key) && technique.system[key]?.value > 0) {
      kiCost[key] = parseInt(technique.system[key].value, 10);
    }
  }
  for (const key in kiAccumulation) {
    if (kiChar.includes(key)) {
      kiAcc[key] = { accumulated: { value: kiAccumulation[key].accumulated.value || 0 } };
    }
  }

  let result = false;

  for (const key in kiCost) {
    if (kiAcc[key].accumulated.value < kiCost[key]) {
      return false;
    } else {
      result = true;
    }
  }
  if (result) {
    for (const key in kiCost) {
      kiAcc[key].accumulated.value -= kiCost[key];
    }
    actor.update({
      system: {
        domine: {
          kiAccumulation: kiAcc
        }
      }
    });
  }
  return result;
};
