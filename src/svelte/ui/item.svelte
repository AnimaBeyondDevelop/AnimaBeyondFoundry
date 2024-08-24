<script>
  import Group from '@svelte/ui/group.svelte';

  /**
   * @typedef {Object} props Properties for the Item componenent
   * @property {import('../../module/items/ABFItem').default} item Item represented by the component
   * @property {boolean} [isInner=false] Whether this item is used inside a parent sheet. Defaults to false.
   * @property {boolean} [contractible=false] Whether it allows the item's body to contract. Defaults to false.
   * @property {string} [cssClass=''] CSS class to apply to the whole Group of the item. Defaults to ''.
   * @property {import('svelte').Snippet} header Snippet with item's group header content.
   * @property {import('svelte').Snippet} body Snippet with item's group body content.
   * @property {import('svelte').Snippet} footer Snippet with item's group footer content.
   */

  /** @type {props} */
  let {
    item = $bindable(),
    isInner = false,
    contractible = $bindable(false),
    cssClass = '',
    header,
    body,
    footer
  } = $props();

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
    if (!isInner || !item.parent) return;

    const { _id, name, img, system } = item;
    item.parent.updateEmbeddedDocuments('Item', [{ _id, name, img, system }], {
      render: false
    });
  }
</script>

<Group title={item.name || ''} bind:contracted {cssClass} {header} {body} {footer}
></Group>
