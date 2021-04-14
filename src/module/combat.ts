// @ts-nocheck

import abfRoll, { modDialog } from "./dice";

export default class abfCombat extends Combat {
  async nextRound() {
    // Reset initiative for everyone when going to the next round
    this.resetAll();

    return super.nextRound();
  }

  // Modify rollInitiative so that it asks for modifiers
  async rollInitiative(
    ids,
    { formula = null, updateTurn = true, messageOptions = {} } = {}
  ) {
    let mod = await modDialog();
    formula = CONFIG.Combat.initiative.formula + `+ ${mod}`;

    return super.rollInitiative(ids, { formula });
  }
}
