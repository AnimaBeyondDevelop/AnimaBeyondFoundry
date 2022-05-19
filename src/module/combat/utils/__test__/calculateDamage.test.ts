import { calculateDamage } from '../calculateDamage';
import {calculateAbsorption} from '../calculateAbsorption';

describe('calculateDamage', () => {
  test('should calculate damage', () => {
    let damage = calculateDamage(calculateAbsorption(200, 100, 2), 50);

    expect(damage).toEqual(30);

    damage = calculateDamage(calculateAbsorption(110, 100, 0), 50);

    expect(damage).toEqual(0);

    damage = calculateDamage(calculateAbsorption(370, 222, 0), 100);

    expect(damage).toEqual(120);
  });
});
