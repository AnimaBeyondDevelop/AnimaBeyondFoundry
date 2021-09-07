import ABFExploderRoll from './ABFExploderRoll';
import ABFRollTesting from '../__mocks__/ABFFoundryRoll';
import ABFFoundryRoll from '../ABFFoundryRoll';
import { nextValueService } from '../__mocks__/nextValueService';

jest.mock('../ABFFoundryRoll');

function getRoll(formula: string) {
  const abfRoll = new ABFFoundryRoll(formula);
  const abfRollTesting = abfRoll as unknown as ABFRollTesting;
  return { abfRoll, abfRollTesting };
}

describe('ABFRoll', () => {
  beforeEach(() => {
    nextValueService.setNextValue(undefined);
  });

  test('must explode roll if first result is bigger or equals to 90', () => {
    const { abfRoll, abfRollTesting } = getRoll('1d100xa');
    nextValueService.setNextValue(90);
    abfRollTesting.evaluate();

    const abfRollProxy = new ABFExploderRoll(abfRoll);

    abfRollProxy.evaluate();

    expect(abfRollProxy.firstDice.results.length).toBe(2);
    expect(abfRollProxy.firstDice.results[0].result).toBe(90);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(90);
  });

  test('must not explode roll if first result is less than 90', () => {
    const { abfRoll, abfRollTesting } = getRoll('1d100xa');
    nextValueService.setNextValue(89);
    abfRollTesting.evaluate();

    const abfRollProxy = new ABFExploderRoll(abfRoll);

    abfRollProxy.evaluate();

    expect(abfRollProxy.firstDice.results.length).toBe(1);
    expect(abfRollProxy.firstDice.results[0].result).toBe(89);
    expect(abfRollProxy.getRoll().total).toBe(89);
  });

  test('must explode multiple times increasing open range', () => {
    const { abfRoll, abfRollTesting } = getRoll('1d100xa');
    nextValueService.setNextValue(90);
    abfRollTesting.evaluate();

    const abfRollProxy = new ABFExploderRoll(abfRoll);

    nextValueService.setNextValue(91);
    abfRollProxy.evaluate();

    expect(abfRollProxy.firstDice.results.length).toBeGreaterThan(1);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(90 + 91);
  });
});
