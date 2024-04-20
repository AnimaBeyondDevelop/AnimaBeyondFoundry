<script>
  import Group from '@svelte/ui/group.svelte';

  /**
   * @type {import('../../module/items/ABFItem').default}
   * Item represented by the component
   */
  export let item;
  /** Whether it allows the item's body to contract. Defaults to false. */
  export let contractible = false;
  /** CSS class to apply to the whole Group of the item */
  export let cssClass = '';

  function onContract(event) {
    if (!contractible) return;
    item.setFlag('animabf', 'contracted', event.detail.contracted);
  }

  let contracted = contractible
    ? /** @type {boolean} */ (item.getFlag('animabf', 'contracted')) || false
    : undefined;

  $: onItemChange(item);

  /**
   * Function runned every time `item` is changed
   * @param {import('../../module/items/ABFItem').default} item
   */
  function onItemChange(item) {
    if (!item.parent) return;

    const { _id, name, img, system } = item;
    item.parent.updateEmbeddedDocuments('Item', [{ _id, name, img, system }], {
      render: true
    });
  }
</script>

<Group title={item.name || ''} {contracted} {cssClass} on:contract={onContract}>
  <slot name="header" slot="header" />
  <slot name="body" slot="body" />
  <slot name="footer" slot="footer" />
</Group>
