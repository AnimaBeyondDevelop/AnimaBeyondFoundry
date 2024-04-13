/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateCombatData = data => {
  const { combat: { attack, block, dodge }, general: { modifiers } } = data;

  attack.final.value =
    attack.base.value +
    attack.special.value +
    modifiers.allActions.final.value +
    modifiers.physicalActions.final.value;

  block.final.value =
    block.base.value +
    block.special.value +
    modifiers.allActions.final.value +
    modifiers.physicalActions.final.value;

  dodge.final.value =
    dodge.base.value +
    dodge.special.value +
    modifiers.allActions.final.value +
    modifiers.physicalActions.final.value;
};
