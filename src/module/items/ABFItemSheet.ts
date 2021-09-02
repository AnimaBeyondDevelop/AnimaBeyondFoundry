import { ABFItems } from './ABFItems';
import ABFItem from './ABFItem';
import { ABFConfig } from '../ABFConfig';

export default class ABFItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sheet', 'item'],
      resizable: true
    });
  }

  constructor(object: ABFItem, options?: Partial<DocumentSheet.Options>) {
    super(object, options);

    this.position.width = this.getWidthFromType();
    this.position.height = this.getHeightFromType();
  }

  getWidthFromType(): number {
    switch (this.item.data.type) {
      case ABFItems.SPELL:
      case ABFItems.ARMOR:
        return 1000;
      case ABFItems.WEAPON:
        return 815;
      default:
        return 900;
    }
  }

  getHeightFromType(): number {
    switch (this.item.data.type) {
      case ABFItems.SPELL:
        return 350;
      case ABFItems.WEAPON:
        return 300;
      case ABFItems.ARMOR:
        return 235;
      case ABFItems.AMMO:
        return 144;
      default:
        return 450;
    }
  }

  getData() {
    const data = super.getData() as ItemSheet.Data & { config?: typeof ABFConfig };

    data.config = CONFIG.config;

    return data;
  }

  get template() {
    const path = 'systems/animabf/templates/items/';
    return `${path}/${this.item.data.type}/${this.item.data.type}.hbs`;
  }
}
