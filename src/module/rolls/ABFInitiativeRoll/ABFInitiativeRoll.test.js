import ABFInitiativeRoll from './ABFInitiativeRoll.js';
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
    const { animabfRoll, animabfRollTesting } = getRoll('1d100Initiative');
    nextValueService.setNextValue(90);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFInitiativeRoll(animabfRoll);

    await animabfRollProxy.evaluate();

    expect(animabfRollProxy.getRoll().getResults().length).toBe(2);
    expect(animabfRollProxy.getRoll().getResults()[0]).toBe(90);
    expect(animabfRollProxy.getRoll().total).toBeGreaterThan(90);
  });

  test('must penalize if roll is 1', async () => {
    const { animabfRoll, animabfRollTesting } = getRoll('1d100Initiative');
    nextValueService.setNextValue(1);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFInitiativeRoll(animabfRoll);

    await animabfRollProxy.evaluate();

    expect(animabfRollProxy.getRoll().getResults().length).toBe(1);
    expect(animabfRollProxy.getRoll().getResults()[0]).toBe(1);
    expect(animabfRollProxy.getRoll().total).toBe(-125);
  });

  test('must penalize if roll is 2', async () => {
    const { animabfRoll, animabfRollTesting } = getRoll('1d100Initiative');
    nextValueService.setNextValue(2);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFInitiativeRoll(animabfRoll);

    await animabfRollProxy.evaluate();

    expect(animabfRollProxy.getRoll().getResults().length).toBe(1);
    expect(animabfRollProxy.getRoll().getResults()[0]).toBe(2);
    expect(animabfRollProxy.getRoll().total).toBe(-100);
  });

  test('must penalize if roll is 3', async () => {
    const { animabfRoll, animabfRollTesting } = getRoll('1d100Initiative');
    nextValueService.setNextValue(3);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFInitiativeRoll(animabfRoll);

    await animabfRollProxy.evaluate();

    expect(animabfRollProxy.getRoll().getResults().length).toBe(1);
    expect(animabfRollProxy.getRoll().getResults()[0]).toBe(3);
    expect(animabfRollProxy.getRoll().total).toBe(-75);
  });
});
