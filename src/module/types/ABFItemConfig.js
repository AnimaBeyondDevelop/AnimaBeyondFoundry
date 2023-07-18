/** Definition of the factory for the concrete ABFItemConfig
 * @module ABFItemConfig
 */

/** Factory for creating ItemConfig objects with default parameters which can be overriden.
 * @param {import("./Items").ABFItemConfigMinimal<D, C>} minimal - Parameters to override the default params.
 * @template D - Template parameter for the (default) data of the item.
 * @template C - Template parameter for the changes of the item data.
 * @returns {import("./Items").ABFItemConfig<D, C>}
 */
export function ABFItemConfigFactory(minimal) {
  if (!minimal.fieldPath) {
    throw new TypeError('TypeError: fieldPath needs to be specified.');
  }

  return {
    clearFieldPath(actor) {
      const path = ['system', ...this.fieldPath];
      const lastKey = path.pop();
      path.reduce((field, nextKey) => field[nextKey], actor)[lastKey] = [];
    },
    addToFieldPath(actor, item) {
      const path = ['system', ...this.fieldPath];
      const lastKey = path.pop();
      const parentField = path.reduce((field, nextKey) => field[nextKey], actor);
      parentField[lastKey] = parentField[lastKey].filter(i => i._id !== item._id);
      parentField[lastKey].push(item);
    },
    async resetFieldPath(actor) {
      this.clearFieldPath(actor);

      const items = actor.getItemsOf(this.type);

      for (const item of items) {
        await this.onAttach?.(actor, item);
        this.addToFieldPath(actor, item);
        this.prepareItem?.(item); // WARN: Does this have any effect on the item stored in the fieldPath?
      }
    },
    ...minimal
  };
}
