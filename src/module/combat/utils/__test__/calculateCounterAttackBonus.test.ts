import { calculateCounterAttackBonus } from '../calculateCounterAttackBonus';

describe('calculateCounterAttackBonus', () => {
  test('should calculate counter attack bonus', () => {
    let bonus = calculateCounterAttackBonus(100, 200);

    expect(bonus).toEqual(50);

    bonus = calculateCounterAttackBonus(100, 167);

    expect(bonus).toEqual(30);

    bonus = calculateCounterAttackBonus(100, 1000);

    expect(bonus).toEqual(150);
  });
});
