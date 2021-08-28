import { ABFItems } from '../actor/utils/prepareSheet/prepareItems/ABFItems';
import ABFItem from './ABFItem';

export default class ABFItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 900,
      classes: ['sheet', 'item'],
      resizable: true
    });
  }

  constructor(object: ABFItem, options?: Partial<DocumentSheet.Options>) {
    super(object, options);

    this.position.height = this.getHeightFromType();
  }

  getHeightFromType(): number {
    switch (this.item.data.type) {
      case ABFItems.WEAPON:
        return 154;
      default:
        return 450;
    }
  }

  get template() {
    const path = 'systems/animabf/templates/items/';
    return `${path}/${this.item.data.type}/${this.item.data.type}.hbs`;
  }
}
