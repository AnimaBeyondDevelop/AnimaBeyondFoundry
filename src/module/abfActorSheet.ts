export default class abfActorSheet extends ActorSheet {

    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ["abf", "sheet", "actor"], 
        template: "systems/animabf/templates/actor-sheet.html",
        width: 600,
        height: 700,
      });
    } 
  };