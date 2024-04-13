const definedMagicCost = [0, 10, 20, 40, 60, 80, 100, 200]
export const definedMagicProjectionCost = sphere => {
  if (sphere === undefined) return 0;
  return definedMagicCost[sphere]
};
