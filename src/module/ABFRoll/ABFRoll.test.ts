import ABFRollProxy from './ABFRollProxy';
import ABFRollTesting from './__mocks__/ABFRoll';
import ABFRoll from './ABFRoll';

jest.mock('./ABFRoll');

function getRoll(formula: string) {
  const abfRoll = new ABFRoll(formula);
  const abfRollTesting = abfRoll as unknown as ABFRollTesting;
  return { abfRoll, abfRollTesting };
}

describe('ABFRoll', () => {
  test('must explode roll if first result is bigger or equals to 90', () => {
    const { abfRoll, abfRollTesting } = getRoll('1d100xa');

    abfRollTesting.addResult(90);

    const abfRollProxy = new ABFRollProxy(abfRoll);

    abfRollProxy.evaluate();

    expect(abfRollProxy.foundryRoll.results.length).toBeGreaterThan(1);
    expect(abfRollProxy.foundryRoll.results[0]).toBe(90);
    expect(abfRollProxy.foundryRoll.total).toBe(
      abfRollProxy.foundryRoll.getResults().reduce((val, curr) => curr + val)
    );
  });
});
