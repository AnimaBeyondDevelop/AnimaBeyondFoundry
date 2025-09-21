import ABFExploderRoll from './ABFExploderRoll';
import ABFRollTesting from '../__mocks__/ABFFoundryRoll';
import ABFFoundryRoll from '../ABFFoundryRoll';
import { nextValueService } from '../__mocks__/nextValueService';
import { jest } from '@jest/globals';

jest.mock('../ABFFoundryRoll');

/**
 * @param {string} formula
 */
function getRoll(formula) {
  const animabfRoll = new ABFFoundryRoll(formula);
  const animabfRollTesting = /** @type {ABFRollTesting} */ (animabfRoll);
  return { animabfRoll, animabfRollTesting };
}

describe('ABFRoll', () => {
  beforeEach(() => {
    nextValueService.setNextValue(undefined);
  });

  test('must explode roll if first result is bigger or equals to 90', () => {
    const { animabfRoll, animabfRollTesting } = getRoll('1d100xa');
    nextValueService.setNextValue(90);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFExploderRoll(animabfRoll);

    animabfRollProxy.evaluate();

    expect(animabfRollProxy.firstDice.results.length).toBe(2);
    expect(animabfRollProxy.firstDice.results[0].result).toBe(90);
    expect(animabfRollProxy.getRoll().total).toBeGreaterThan(90);
  });

  test('must not explode roll if first result is less than 90', () => {
    const { animabfRoll, animabfRollTesting } = getRoll('1d100xa');
    nextValueService.setNextValue(89);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFExploderRoll(animabfRoll);

    animabfRollProxy.evaluate();

    expect(animabfRollProxy.firstDice.results.length).toBe(1);
    expect(animabfRollProxy.firstDice.results[0].result).toBe(89);
    expect(animabfRollProxy.getRoll().total).toBe(89);
  });

  test('must explode multiple times increasing open range', () => {
    const { animabfRoll, animabfRollTesting } = getRoll('1d100xa');
    nextValueService.setNextValue(90);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFExploderRoll(animabfRoll);

    nextValueService.setNextValue(91);
    animabfRollProxy.evaluate();

    expect(animabfRollProxy.firstDice.results.length).toBeGreaterThan(1);
    expect(animabfRollProxy.getRoll().total).toBeGreaterThan(90 + 91);
  });
});
