import ABFExploderRoll from './ABFExploderRoll';
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
    const { abfRoll, abfRollTesting } = getRoll('1d100xa');
    abfRollTesting.setNextValue(90);
    abfRollTesting.evaluate();

    const abfRollProxy = new ABFExploderRoll(abfRoll);

    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().results.length).toBe(2);
    expect(abfRollProxy.getRoll().results[0]).toBe(90);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(90);
  });

  test('must not explode roll if first result is less than 90', () => {
    const { abfRoll, abfRollTesting } = getRoll('1d100xa');
    abfRollTesting.setNextValue(89);
    abfRollTesting.evaluate();

    const abfRollProxy = new ABFExploderRoll(abfRoll);

    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().results.length).toBe(1);
    expect(abfRollProxy.getRoll().results[0]).toBe(89);
    expect(abfRollProxy.getRoll().total).toBe(89);
  });

  test('must explode multiple times increasing open range', () => {
    const { abfRoll, abfRollTesting } = getRoll('1d100xa');
    abfRollTesting.setNextValue(90);
    abfRollTesting.evaluate();

    const abfRollProxy = new ABFExploderRoll(abfRoll);

    abfRollTesting.setNextValue(91);
    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().results.length).toBeGreaterThan(1);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(90 + 91);

    abfRollTesting.setNextValue(92);
    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().results.length).toBeGreaterThan(2);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(90 + 91 + 92);

    abfRollTesting.setNextValue(93);
    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().results.length).toBeGreaterThan(3);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(90 + 91 + 92 + 93);

    abfRollTesting.setNextValue(94);
    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().results.length).toBeGreaterThan(4);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(90 + 91 + 92 + 93 + 94);

    abfRollTesting.setNextValue(95);
    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().results.length).toBeGreaterThan(5);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(90 + 91 + 92 + 93 + 94 + 95);

    abfRollTesting.setNextValue(96);
    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().results.length).toBeGreaterThan(6);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(
      90 + 91 + 92 + 93 + 94 + 95 + 96
    );

    abfRollTesting.setNextValue(97);
    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().results.length).toBeGreaterThan(7);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(
      90 + 91 + 92 + 93 + 94 + 95 + 96 + 97
    );

    abfRollTesting.setNextValue(98);
    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().results.length).toBeGreaterThan(8);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(
      90 + 91 + 92 + 93 + 94 + 95 + 96 + 97 + 98
    );

    abfRollTesting.setNextValue(99);
    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().results.length).toBeGreaterThan(9);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(
      90 + 91 + 92 + 93 + 94 + 95 + 96 + 97 + 98 + 99
    );

    abfRollTesting.setNextValue(100);
    abfRollProxy.evaluate();

    expect(abfRollProxy.getRoll().results.length).toBeGreaterThan(10);
    expect(abfRollProxy.getRoll().total).toBeGreaterThan(
      90 + 91 + 92 + 93 + 94 + 95 + 96 + 97 + 98 + 99 + 100
    );
  });
});
