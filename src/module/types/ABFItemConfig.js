/** Definition of the factory for the concrete ABFItemConfig
 * @module ABFItemConfig
 */

/** Factory for creating ItemConfig objects with default parameters which can be overriden.
 * @param {import("./Items").ABFItemConfigMinimal<TData>} minimal
 * - Parameters to override the default params.
 * @template TData - Type of the data inside the item's system attribute.
 * @returns {import("./Items").ABFItemConfig<TData>}
 */
export function ABFItemConfigFactory(minimal) {
  if (!minimal.fieldPath) {
    throw new TypeError('TypeError: fieldPath needs to be specified.');
  }

  return {
    getFromDynamicChanges(changes) {
      const path = ['system', 'dynamic', ...this.fieldPath.slice(-1)];
      return path.reduce((field, nextKey) => field[nextKey], changes);
    },
    clearFieldPath(actor) {
      const path = ['system', ...this.fieldPath];
      const lastKey = path.pop();
      path.reduce((field, nextKey) => field[nextKey], actor)[lastKey] = [];
    },
    addToFieldPath(actor, item) {
      const path = ['system', ...this.fieldPath];
      const lastKey = path.pop();
      const parentField = path.reduce((field, nextKey) => field[nextKey], actor);
      const index = parentField[lastKey].findIndex(i => i._id === item._id);
      if (index === -1) { // If item not in parentField[lastKey]
        parentField[lastKey].push(item);
      } else {
        parentField[lastKey][index] = item;
      }
    },
    async resetFieldPath(actor) {
      const items = actor.getItemsOf(this.type);

      for (const item of items) {
        await this.onAttach?.(actor, item);
        this.addToFieldPath(actor, item);
        this.prepareItem?.(item);
      }
    },
    async onUpdate(actor, changes) {
      for (const id of Object.keys(changes)) {
        const { name, system } = changes[id];

        const itemData = system ? { id, name, system } : { id, name };

        if (this.isInternal) {
          actor.updateInnerItem({ type: this.type, ...itemData });
        } else {
          await actor.updateItem(itemData);
        }
      }
    },
    ...minimal
  };
}
