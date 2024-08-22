<script>
  import Group from '@svelte/ui/group.svelte';

  /**
   * @typedef {Object} props Properties for the Item componenent
   * @property {import('../../module/items/ABFItem').default} item Item represented by the component
   * @property {boolean} [contractible=false] Whether it allows the item's body to contract. Defaults to false.
   * @property {string} [cssClass=''] CSS class to apply to the whole Group of the item. Defaults to ''.
   */

  /** @type {props} */
  let { item, contractible = $bindable(false), cssClass = '' } = $props();

  let contracted = $state(
    contractible
      ? /** @type {boolean} */ (item.getFlag('animabf', 'contracted')) || false
      : undefined
  );

  $effect(() => {
    if (!contractible) return;
    item.setFlag('animabf', 'contracted', contracted);
  });

  $effect(() => onItemChange(item));

  /**
   * Function runned every time `item` is changed
   * @param {import('../../module/items/ABFItem').default} item
   */
  function onItemChange(item) {
    if (!item.parent) return;

    const { _id, name, img, system } = item;
    item.parent.updateEmbeddedDocuments('Item', [{ _id, name, img, system }], {
      render: false
    });
  }
</script>

<Group title={item.name || ''} bind:contracted {cssClass}>
  <slot name="header" slot="header" />
  <slot name="body" slot="body" />
  <slot name="footer" slot="footer" />
</Group>
