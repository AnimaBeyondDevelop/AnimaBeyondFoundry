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
      return path.reduce((field, nextKey) => field?.[nextKey], changes);
    },
    cleanFieldPath(actor) {
      if (this.isInternal) return;
      if (!this.fieldPath.length) return;

      const currentItems = actor.itemTypes?.[this.type] ?? [];
      const path = ['system', ...this.fieldPath];
      const lastKey = path.pop();
      if (!lastKey) return;

      const parentField = path.reduce((field, nextKey) => field?.[nextKey], actor);
      if (!parentField || typeof parentField !== 'object') return;

      const current = Array.isArray(parentField[lastKey]) ? parentField[lastKey] : [];
      parentField[lastKey] = current.filter(i => currentItems.includes(i));
    },
    addToFieldPath(actor, item) {
      if (!this.fieldPath.length) return;

      const path = ['system', ...this.fieldPath];
      const lastKey = path.pop();
      if (!lastKey) return;

      let parentField = actor;
      for (const nextKey of path) {
        if (!parentField[nextKey] || typeof parentField[nextKey] !== 'object') {
          parentField[nextKey] = {};
        }
        parentField = parentField[nextKey];
      }

      if (!Array.isArray(parentField[lastKey])) {
        parentField[lastKey] = [];
      }

      const index = parentField[lastKey].findIndex(i => i._id === item._id);
      if (index === -1) {
        parentField[lastKey].push(item);
      } else {
        parentField[lastKey][index] = item;
      }
    },
    async resetFieldPath(actor) {
      if (!this.isInternal) {
        this.cleanFieldPath(actor);

        if (this.fieldPath.length) {
          const path = ['system', ...this.fieldPath];
          const lastKey = path.pop();
          if (lastKey) {
            let parentField = actor;
            for (const nextKey of path) {
              if (!parentField[nextKey] || typeof parentField[nextKey] !== 'object') {
                parentField[nextKey] = {};
              }
              parentField = parentField[nextKey];
            }
            parentField[lastKey] = [];
          }
        }
      }

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
