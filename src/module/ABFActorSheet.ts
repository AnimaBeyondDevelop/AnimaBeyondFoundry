import { openModDialog } from './utils/openModDialog';
import ABFFoundryRoll from './rolls/ABFFoundryRoll';

export default class ABFActorSheet extends ActorSheet {
  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      ...{
        classes: ['abf', 'sheet', 'actor'],
        template: `systems/animabf/templates/actor-sheet.html`,
        width: 600,
        height: 700,
        tabs: [
          {
            navSelector: '.sheet-tabs',
            contentSelector: '.sheet-body',
            initial: 'main'
          }
        ]
      }
    };
  }

  getData(): any {
    const data: any = super.getData();
    data.dtypes = ['String', 'Number', 'Boolean'];

    if (this.actor.data.type == 'character') {
      ABFActorSheet._prepareItemContainers(data);
    }

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    html.find('.skillcreate').click(this._onSkillCreate.bind(this));

    html.find('.skilldelete').click((ev: { currentTarget: any }) => {
      const li = $(ev.currentTarget).parents('.item');
      this.actor.deleteOwnedItem(li.data('itemId'));
      li.slideUp(200, () => this.render(false));
    });
  }

  _onSkillCreate(event: { preventDefault: () => void; currentTarget: any }) {
    event.preventDefault();
    let element = event.currentTarget;

    let itemData = {
      name: game.i18n.localize('anima.newSkill'),
      type: element.dataset.type
    };

    return this.actor.createOwnedItem(itemData);
  }

  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      let mod = await openModDialog();
      let formula = dataset.roll + `+ ${mod}`;
      let roll = new ABFFoundryRoll(formula, this.actor.data.data);
      console.log(roll);

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  protected static _prepareItemContainers(sheetData: { actor: any; items: any }): void {
    const actorData = sheetData.actor;

    const consumable: Item[] = [];
    const misc: Item[] = [];
    const weapon: Item[] = [];
    const shield: Item[] = [];
    const ammunition: Item[] = [];
    const armor: Item[] = [];
    const helmet: Item[] = [];
    const skill: Item[] = [];

    for (const i of sheetData.items) {
      i.img = i.img || CONST.DEFAULT_TOKEN;
      switch (i.type) {
        case 'cosumable':
          consumable.push(i);
          break;
        case 'misc':
          misc.push(i);
          break;
        case 'weapon':
          weapon.push(i);
          break;
        case 'shield':
          shield.push(i);
          break;
        case 'ammunition':
          ammunition.push(i);
          break;
        case 'armor':
          armor.push(i);
          break;
        case 'helmet':
          helmet.push(i);
          break;
        case 'skill':
          skill.push(i);
          break;
        default:
          break;
      }
    }

    actorData.consumable = consumable;
    actorData.misc = misc;
    actorData.weapon = weapon;
    actorData.shield = shield;
    actorData.ammunition = ammunition;
    actorData.armor = armor;
    actorData.helmet = helmet;
    actorData.skill = skill;
  }
}
