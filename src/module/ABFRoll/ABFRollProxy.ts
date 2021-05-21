import ABFRoll from './ABFRoll';

export default class ABFRollProxy {
  public readonly foundryRoll: ABFRoll;

  private openRange = 90;
  private fumbleRange = 3;

  private readonly canExplode: boolean;

  constructor(foundryRoll: ABFRoll) {
    this.foundryRoll = foundryRoll;

    this.canExplode = this.foundryRoll._formula.includes('xa');
  }

  public evaluate({
    minimize,
    maximize
  }: {
    minimize?: boolean;
    maximize?: boolean;
  } = {}): ABFRoll {
    if (this.canExplode && this.foundryRoll.results[0] >= this.openRange) {
      this.explodeDice(this.openRange);
    }

    // let isTurno = this.foundryRoll.formula.includes('Turno');
    //
    // // Erase keywords from formula so they aren't showed later in chat
    // if (isTurno) {
    //   this.foundryRoll.formula = this.foundryRoll.formula.replace('Turno', '');
    //
    //   this.foundryRoll.terms[0].modifiers[0] =
    //     this.foundryRoll.terms[0].modifiers[0].replace('Turno', '');
    // }
    //
    //
    // // Case - Fumble on initiative
    // if (isTurno && this.foundryRoll.results[0] <= fumbleRange) {
    //   let pen = 0;
    //   switch (this.foundryRoll.results[0]) {
    //     case 1:
    //       pen = -125;
    //       break;
    //     case 2:
    //       pen = -100;
    //       break;
    //     case 3:
    //       pen = -75;
    //       break;
    //   }
    //
    //   this.foundryRoll._total = this.foundryRoll._total - this.foundryRoll.results[0] + pen;
    // }

    return this.foundryRoll;
  }

  private explodeDice(openRange: number) {
    const newRoll = new ABFRoll(`1d100`).evaluate();
    const newResult = this.addRoll(newRoll);

    if (newResult >= Math.min(openRange, 100)) {
      this.explodeDice(openRange + 1);
    }
  }

  private addRoll(newRoll: ABFRoll) {
    const newResult = { result: newRoll.results[0] as number, active: true };

    this.foundryRoll.results.push(newResult.result);

    const pool = this.foundryRoll.terms[0];

    pool.results.push(newResult);

    this.foundryRoll.recalculateTotal();

    return newRoll.results[0];
  }
}
