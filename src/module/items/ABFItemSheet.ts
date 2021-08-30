import { ABFItems } from '../actor/utils/prepareSheet/prepareItems/ABFItems';
import ABFItem from './ABFItem';

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
      case ABFItems.WEAPON:
        return 1300;
      default:
        return 900;
    }
  }

  getHeightFromType(): number {
    switch (this.item.data.type) {
      case ABFItems.WEAPON:
      case ABFItems.ARMOR:
        return 165;
      default:
        return 450;
    }
  }

  get template() {
    const path = 'systems/animabf/templates/items/';
    return `${path}/${this.item.data.type}/${this.item.data.type}.hbs`;
  }
}
