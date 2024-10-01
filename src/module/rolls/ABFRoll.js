import ABFFoundryRoll from './ABFFoundryRoll';

/**
 * @abstract
 */
export class ABFRoll {
  /**
   * @protected
   * @readonly
   */
  DEFAULT_FUMBLE_RANGE = 3;
  /**
   * @protected
   * @readonly
   */
  DEFAULT_OPEN_RANGE = 90;
  /**
   * @protected
   * @readonly
   */
  DEFAULT_OPEN_WITH_DOUBLES = false;

  /**
   * @protected
   */
  openRollRange = this.DEFAULT_OPEN_RANGE;
  /**
   * @protected
   */
  fumbleRange = this.DEFAULT_FUMBLE_RANGE;
  /**
   * @protected
   */
  openOnDoubles = this.DEFAULT_OPEN_WITH_DOUBLES;
  /**
   * @protected
   * @readonly
   * @type {ABFFoundryRoll}
   */
  foundryRoll;

  /**
   * @param {ABFFoundryRoll} foundryRoll
   */
  constructor(foundryRoll) {
    this.foundryRoll = foundryRoll;
    if (this.foundryRoll.data.general !== undefined) {
      this.openOnDoubles = this.foundryRoll.data.general.settings.openOnDoubles.value;
      this.openRollRange = this.foundryRoll.data.general.settings.openRolls.value;
      if (this.openRollRange === 0) {
        // If openRollRange is set to 0 it's probably an actor from 1.14 that hasn't been configured
        this.openRollRange = this.DEFAULT_OPEN_RANGE;
      }
      this.fumbleRange = this.foundryRoll.data.general.settings.fumbles.value;
      if (foundryRoll.formula.includes('mastery') && this.fumbleRange > 1)
        this.fumbleRange -= 1;
    }
  }

  get firstDice() {
    return this.foundryRoll.dice[0];
  }

  /**
   * @protected
   * @param {ABFFoundryRoll} newRoll
   */
  addRoll(newRoll) {
    this.firstDice.results.push({
      result: newRoll.getResults()[0],
      active: true
    });

    return newRoll.getResults()[0];
  }

  getRoll() {
    return this.foundryRoll;
  }

  /**
   * @abstract
   * @return {Promise<ABFFoundryRoll>}
   */
  evaluate(options) {}
}
