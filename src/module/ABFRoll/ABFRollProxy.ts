import ABFRoll from './ABFRoll';

export default class ABFRollProxy {
  private readonly foundryRoll: ABFRoll;

  constructor(foundryRoll: ABFRoll) {
    this.foundryRoll = foundryRoll;
  }

  public evaluate({
    minimize,
    maximize
  }: {
    minimize?: boolean;
    maximize?: boolean;
  } = {}): ABFRoll {
    // let openRange = 90;
    // let fumbleRange = 3;
    // let canExplode = this.foundryRoll.formula.includes('xa');
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
    // // Case - Open roll
    // if (canExplode && this.foundryRoll.results[0] >= openRange) {
    //   let x = this.foundryRoll.results[0];
    //
    //   while (x >= openRange) {
    //     let newRoll = this.foundryRoll.create('1d100').evaluate();
    //     let newResult = { result: newRoll.results[0], active: true };
    //
    //     // Rewrite result data
    //     this.foundryRoll.results[0] += newRoll.results[0];
    //     this.foundryRoll.total += newRoll.total;
    //
    //     this.foundryRoll.terms[0].results.push(newResult);
    //
    //     // Flag previous result as exploded
    //
    //     this.foundryRoll.terms[0].results[
    //       this.foundryRoll.terms[0].results.length - 2
    //     ].exploded = true;
    //
    //     // Update loop conditions (x is defined here because using "this.foundryRoll" is weird and this.foundryRoll works)
    //     x = newRoll.results[0];
    //     openRange = Math.min(openRange + 1, 100);
    //   }
    // }
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
    //   this.foundryRoll.total = this.foundryRoll.total - this.foundryRoll.results[0] + pen;
    // }

    console.log('Holi');
    return this.foundryRoll;
  }
}
