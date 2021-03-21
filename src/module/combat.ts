// @ts-nocheck

import abfRoll, { modDialog } from "./dice";

export default class abfCombat extends Combat {
  async nextRound() {
    // Reset initiative for everyone when going to the next round
    this.resetAll();

    super.nextRound();
  }

  /* _getInitiativeRoll(combatant, formula) {
    let roll = super._getInitiativeRoll(combatant, formula);

    // Apply special Fumble modifiers:
  } */

  // Modify rollInitiative so that it asks for modifiers
  async rollInitiative(
    ids,
    { formula = null, updateTurn = true, messageOptions = {} } = {}
  ) {
    // Structure input data
    ids = typeof ids === "string" ? [ids] : ids;
    const currentId = this.combatant._id;

    ///////////////////////////////////////////////
    // Actual change #1: modDialog. For some reason it can't be defined inside the reducer.
    let mod = await modDialog();

    // Iterate over Combatants, performing an initiative roll for each
    const [updates, messages] = ids.reduce(
      (results, id, i) => {
        let [updates, messages] = results;

        // Get Combatant data
        const c = this.getCombatant(id);
        if (!c || !c.owner) return results;

        // Roll initiative
        //////////////////////////////////////////////
        // Actual change #2: Add mod to the roll formula
        const cf =
          mod !== 0
            ? this._getInitiativeFormula(c) + `+${mod}`
            : this._getInitiativeFormula(c);
        const roll = this._getInitiativeRoll(c, cf);
        updates.push({ _id: id, initiative: roll.total });

        // Determine the roll mode
        let rollMode =
          messageOptions.rollMode || game.settings.get("core", "rollMode");
        if ((c.token.hidden || c.hidden) && rollMode === "roll")
          rollMode = "gmroll";

        // Construct chat message data
        let messageData = mergeObject(
          {
            speaker: {
              scene: canvas.scene._id,
              actor: c.actor ? c.actor._id : null,
              token: c.token._id,
              alias: c.token.name,
            },
            flavor: `${c.token.name} rolls for Initiative!`,
            flags: { "core.initiativeRoll": true },
          },
          messageOptions
        );
        const chatData = roll.toMessage(messageData, {
          create: false,
          rollMode,
        });

        // Play 1 sound for the whole rolled set
        if (i > 0) chatData.sound = null;
        messages.push(chatData);

        // Return the Roll and the chat data
        return results;
      },
      [[], []]
    );
    if (!updates.length) return this;

    // Update multiple combatants
    await this.updateEmbeddedEntity("Combatant", updates);

    // Ensure the turn order remains with the same combatant
    if (updateTurn) {
      await this.update({
        turn: this.turns.findIndex((t) => t._id === currentId),
      });
    }

    // Create multiple chat messages
    await CONFIG.ChatMessage.entityClass.create(messages);

    // Return the updated Combat
    return this;
  }
}
