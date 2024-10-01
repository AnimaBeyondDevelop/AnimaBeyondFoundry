/** @typedef {import('./Migration').Migration} Migration */

import { Logger } from '../../../utils';

const newItems = {
  get ready() {
    return !!this.spell && !!this.psychicPowers;
  },
  async init() {
    if (this.ready) return;
    this.spell = await game.packs.get('animabf.magic').getDocuments();
    this.psychicPower = await game.packs.get('animabf.psychic').getDocuments();
  },
  async get(itemType, name) {
    if (!this.ready) await this.init();
    return this[itemType].find(i => i.name.toLowerCase() === name.toLowerCase());
  }
};

/** @type Migration */
export const Migration5UpdateSpellsPowers = {
  version: 5,
  title: 'Update inner spells and psychic powers to match compendia',
  description:
    'This migration updates existing spells and psychic powers to match some changes made on compendia. ' +
    'Any custom description on spells or powers will be left unchanged. ' +
    'Additionally, any custom spell or power will be left unchanged, but you will need to update ' +
    'those manually for the newest features to work correctly.',
  filterItems(item) {
    return (
      ['spell', 'psychicPower'].includes(item.type) &&
      !['animabf.magic', 'animabf.psychic'].includes(item.pack)
    );
  },
  filterActors(actor) {
    return actor.items.filter(i => ['spell', 'psychicPower'].includes(i.type)).length > 0;
  },
  async updateItem(item) {
    if (!['spell', 'psychicPower'].includes(item.type)) {
      Logger.error('spell/psychicPower filter not working');
      return;
    }

    let name = item.name.includes('-') ? item.name.split(' - ')[1] : item.name;

    let newItem = await newItems.get(item.type, name);
    if (!newItem) return;

    item.name = newItem.name;
    const { system } = newItem;
    system.description.value = item.system.description.value;
    item.system = system;

    return item;
  }
};
