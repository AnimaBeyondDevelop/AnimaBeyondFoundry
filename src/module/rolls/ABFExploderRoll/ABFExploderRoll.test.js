import ABFExploderRoll from './ABFExploderRoll.js';
import ABFFoundryRoll from '../__mocks__/ABFFoundryRoll.js';
import { nextValueService } from '../__mocks__/nextValueService.js';

/**
 * @param {string} formula
 */
function getRoll(formula) {
  const animabfRoll = new ABFFoundryRoll(formula);
  return { animabfRoll, animabfRollTesting: animabfRoll };
}

describe('ABFRoll', () => {
  beforeEach(() => {
    nextValueService.setNextValue(undefined);
  });

  test('must explode roll if first result is bigger or equals to 90', async () => {
    const { animabfRoll, animabfRollTesting } = getRoll('1d100xa');
    nextValueService.setNextValue(90);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFExploderRoll(animabfRoll);

    await animabfRollProxy.evaluate();

    expect(animabfRollProxy.firstDice.results.length).toBe(2);
    expect(animabfRollProxy.firstDice.results[0].result).toBe(90);
    expect(animabfRollProxy.getRoll().total).toBeGreaterThan(90);
  });

  test('must not explode roll if first result is less than 90', async () => {
    const { animabfRoll, animabfRollTesting } = getRoll('1d100xa');
    nextValueService.setNextValue(89);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFExploderRoll(animabfRoll);

    await animabfRollProxy.evaluate();

    expect(animabfRollProxy.firstDice.results.length).toBe(1);
    expect(animabfRollProxy.firstDice.results[0].result).toBe(89);
    expect(animabfRollProxy.getRoll().total).toBe(89);
  });

  test('must explode multiple times increasing open range', async () => {
    const { animabfRoll, animabfRollTesting } = getRoll('1d100xa');
    nextValueService.setNextValue(90);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFExploderRoll(animabfRoll);

    nextValueService.setNextValue(91);
    await animabfRollProxy.evaluate();

    expect(animabfRollProxy.firstDice.results.length).toBeGreaterThan(1);
    expect(animabfRollProxy.getRoll().total).toBeGreaterThan(90 + 91);
  });
});
