import ABFInitiativeRoll from './ABFInitiativeRoll';
import ABFRollTesting from '../__mocks__/ABFFoundryRoll';
import ABFFoundryRoll from '../ABFFoundryRoll';

jest.mock('../ABFFoundryRoll');

function getRoll(formula: string) {
  const abfRoll = new ABFFoundryRoll(formula);
  const abfRollTesting = abfRoll as unknown as ABFRollTesting;
  return { abfRoll, abfRollTesting };
}

describe('ABFRoll', () => {
  test('must explode roll if first result is bigger or equals to 90', () => {
    const { abfRoll, abfRollTesting } = getRoll('1d100xaturn');
    abfRollTesting.setNextValue(90);
    abfRollTesting.evaluate();

    const abfRollProxy = new ABFInitiativeRoll(abfRoll);

    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().getResults().length).toBe(2);
    expect(abfRollProxy.getRoll().getResults()[0]).toBe(90);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(90);
  });

  test('must penalize if roll is 1', () => {
    const { abfRoll, abfRollTesting } = getRoll('1d100xaturn');
    abfRollTesting.setNextValue(1);
    abfRollTesting.evaluate();

    const abfRollProxy = new ABFInitiativeRoll(abfRoll);

    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().getResults().length).toBe(1);
    expect(abfRollProxy.getRoll().getResults()[0]).toBe(1);
    expect(abfRollProxy.getRoll().total).toBe(1 - 125);
  });

  test('must penalize if roll is 2', () => {
    const { abfRoll, abfRollTesting } = getRoll('1d100xaturn');
    abfRollTesting.setNextValue(2);
    abfRollTesting.evaluate();

    const abfRollProxy = new ABFInitiativeRoll(abfRoll);

    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().getResults().length).toBe(1);
    expect(abfRollProxy.getRoll().getResults()[0]).toBe(2);
    expect(abfRollProxy.getRoll().total).toBe(2 - 100);
  });

  test('must penalize if roll is 3', () => {
    const { abfRoll, abfRollTesting } = getRoll('1d100xaturn');
    abfRollTesting.setNextValue(3);
    abfRollTesting.evaluate();

    const abfRollProxy = new ABFInitiativeRoll(abfRoll);

    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().getResults().length).toBe(1);
    expect(abfRollProxy.getRoll().getResults()[0]).toBe(3);
    expect(abfRollProxy.getRoll().total).toBe(3 - 75);
  });
});
