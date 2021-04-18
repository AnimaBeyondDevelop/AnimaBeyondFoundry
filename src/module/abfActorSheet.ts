// @ts-nocheck

import abfRoll, { modDialog } from "./dice";

export default class abfActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["abf", "sheet", "actor"],
      template: "systems/animabf/templates/actor-sheet.html",
      width: 600,
      height: 700,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "main",
        },
      ],
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Rollable abilities.
    html.find(".rollable").click(this._onRoll.bind(this));
  }

  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let label = dataset.label ? `Rolling ${dataset.label}` : "";
      let mod = await modDialog();
      let formula = dataset.roll + `+ ${mod}`;
      let roll = new abfRoll(formula, this.actor.data.data);
      console.log(roll);

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
      });
    }
  }
}
