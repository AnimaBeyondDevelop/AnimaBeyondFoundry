export const mutateTechniquesData = data => {
  const domine = data.domine;

  domine.techniques = domine.techniques.map(technique => {
    if (technique._source.effects[0] == undefined) {
      technique.system.activeEffect.hasEffects = false;
    } else {
      technique.system.activeEffect.hasEffects = true;
    }

    return technique;
  });
};
