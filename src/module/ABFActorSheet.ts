import * as SYSTEM from '../system.json';

export default class ABFActorSheet extends ActorSheet {
  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      ...{
        classes: ['abf', 'sheet', 'actor'],
        template: `systems/${SYSTEM.name}/templates/actor-sheet.html`,
        width: 600,
        height: 700
      }
    };
  }
}
