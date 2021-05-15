export default class ABFRoll extends Roll {
  evaluate({ minimize = false, maximize = false } = {}) {
    super.evaluate();
    return abfDice(this);
  }
}

// Function with all the custom roll options
// TODO: Extract Turno and Explode capabilities into function and unit test it
export function abfDice(roll: Roll) {
  let openRange = 90;
  let fumbleRange = 3;
  let formula = roll.formula;
  let canExplode = formula.includes('xa');
  let isTurno = formula.includes('Turno');

  // Erase keywords from formula so they aren't showed later in chat
  if (isTurno) {
    // @ts-ignore
    roll._formula = roll.formula.replace('Turno', '');

    // @ts-ignore
    roll.terms[0].modifiers[0] = roll.terms[0].modifiers[0].replace('Turno', '');
  }

  // Case - Open roll
  if (canExplode && roll.results[0] >= openRange) {
    let x = roll.results[0];

    while (x >= openRange) {
      let newRoll = new Roll('1d100').evaluate();
      let newResult = { result: newRoll.results[0], active: true };

      // Rewrite result data
      // @ts-ignore
      roll.results[0] += newRoll.results[0];
      // @ts-ignore
      roll._total += newRoll._total;
      // @ts-ignore
      roll.terms[0].results.push(newResult);

      // Flag previous result as exploded
      // @ts-ignore
      roll.terms[0].results[roll.terms[0].results.length - 2].exploded = true;

      // Update loop conditions (x is defined here because using "this" is weird and this works)
      x = newRoll.results[0];
      openRange = Math.min(openRange + 1, 100);
    }
  }
  // Case - Fumble on initiative
  if (isTurno && roll.results[0] <= fumbleRange) {
    let pen = 0;
    switch (roll.results[0]) {
      case 1:
        pen = -125;
        break;
      case 2:
        pen = -100;
        break;
      case 3:
        pen = -75;
        break;
    }
    // @ts-ignore
    roll._total = roll._total - roll.results[0] + pen;
  }

  return roll;
}

