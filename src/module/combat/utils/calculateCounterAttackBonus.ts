const roundCounterAttack = (value: number): number => Math.floor(value / 5) * 5;

export const calculateCounterAttackBonus = (attack: number, defense: number) => {
  return Math.min(roundCounterAttack((defense - attack) / 2), 150);
};
