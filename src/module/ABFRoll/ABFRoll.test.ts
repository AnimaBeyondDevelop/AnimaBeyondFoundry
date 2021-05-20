import ABFRollProxy from './ABFRollProxy';
import ABFRoll from './ABFRoll';

jest.mock('./ABFRoll', () => {
  return function () {
    return { playSoundFile: () => {} };
  };
});

describe('ABFRoll', () => {
  test('must roll', () => {
    const abfRollProxy = new ABFRollProxy(new ABFRoll(''));

    abfRollProxy.evaluate();
  });
});
