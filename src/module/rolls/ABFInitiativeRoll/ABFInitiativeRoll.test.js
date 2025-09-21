import ABFInitiativeRoll from './ABFInitiativeRoll';
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
    const { animabfRoll, animabfRollTesting } = getRoll('1d100Initiative');
    nextValueService.setNextValue(90);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFInitiativeRoll(animabfRoll);

    animabfRollProxy.evaluate();

    expect(animabfRollProxy.getRoll().getResults().length).toBe(2);
    expect(animabfRollProxy.getRoll().getResults()[0]).toBe(90);
    expect(animabfRollProxy.getRoll().total).toBeGreaterThan(90);
  });

  test('must penalize if roll is 1', () => {
    const { animabfRoll, animabfRollTesting } = getRoll('1d100Initiative');
    nextValueService.setNextValue(1);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFInitiativeRoll(animabfRoll);

    animabfRollProxy.evaluate();

    expect(animabfRollProxy.getRoll().getResults().length).toBe(1);
    expect(animabfRollProxy.getRoll().getResults()[0]).toBe(1);
    expect(animabfRollProxy.getRoll().total).toBe(1 - 125);
  });

  test('must penalize if roll is 2', () => {
    const { animabfRoll, animabfRollTesting } = getRoll('1d100Initiative');
    nextValueService.setNextValue(2);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFInitiativeRoll(animabfRoll);

    animabfRollProxy.evaluate();

    expect(animabfRollProxy.getRoll().getResults().length).toBe(1);
    expect(animabfRollProxy.getRoll().getResults()[0]).toBe(2);
    expect(animabfRollProxy.getRoll().total).toBe(2 - 100);
  });

  test('must penalize if roll is 3', () => {
    const { animabfRoll, animabfRollTesting } = getRoll('1d100Initiative');
    nextValueService.setNextValue(3);
    animabfRollTesting.evaluate();

    const animabfRollProxy = new ABFInitiativeRoll(animabfRoll);

    animabfRollProxy.evaluate();

    expect(animabfRollProxy.getRoll().getResults().length).toBe(1);
    expect(animabfRollProxy.getRoll().getResults()[0]).toBe(3);
    expect(animabfRollProxy.getRoll().total).toBe(3 - 75);
  });
});
