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
      parentField[lastKey] = parentField[lastKey].filter(i => i._id !== item._id);
      parentField[lastKey].push(item);
    },
    async resetFieldPath(actor) {
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
