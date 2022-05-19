import { calculateDamage } from '../calculateDamage';

describe('calculateDamage', () => {
  test('should calculate damage', () => {
    let damage = calculateDamage(200, 100, 2, 50);

    expect(damage).toEqual(30);

    damage = calculateDamage(110, 100, 0, 50);

    expect(damage).toEqual(0);

    damage = calculateDamage(370, 222, 0, 100);

    expect(damage).toEqual(120);
  });
});
