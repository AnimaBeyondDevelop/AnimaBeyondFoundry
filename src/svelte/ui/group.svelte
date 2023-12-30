<script>
  import { createEventDispatcher } from 'svelte';

  /**
   * Title of the group, used for the group header if no group header slot is provided.
   * @type {string}
   */
  export let title;
  /**
   * Data passed to the click event on the add row button. If undefined, no add button is rendered
   * @type {string | undefined}
   */
  export let addRowButtonData = undefined;
  /** CSS class for the add row button */
  export let addRowButtonClass = '';
  /** CSS class to apply to every element on the group */
  export let cssClass = '';
  /**
   * Whether the group body is contracted or not.
   * If `undefined`, the group is assumed to be uncontractible, which is the default.
   * @type {boolean | undefined}
   */
  export let contracted = undefined;

  let contractible = contracted !== undefined;

  let dispatch = createEventDispatcher();
  function onContract() {
    contracted = !contracted;
    dispatch('contract', { contracted });
  }
</script>

<div
  class="common-group {cssClass}"
  class:contractible-group={contractible}
  class:contracted
>
  {#if contractible}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
    <img
      class="contractible-button"
      class:contracted
      src="/systems/animabf/assets/icons/own/expand-up.png"
      alt="Contract button"
      on:click={onContract}
    />
  {/if}

  <!-- Header start -->
  <div class="group-header {cssClass}">
    <slot name="header">
      {#if addRowButtonData}
        <img
          class="{addRowButtonClass} add-button"
          data-on-click={addRowButtonData}
          src="/systems/animabf/assets/icons/game-icons.net/ffffff/sbed/add.svg"
          alt="Add row button"
        />
      {/if}
      <h3 class="group-header-title">{title}</h3>
    </slot>
  </div>
  <!-- Header end -->

  <!-- Body start -->
  <div id="{cssClass}-context-menu-container" class="group-body {cssClass}">
    <slot name="body" />
  </div>
  <!-- Body end -->

  <!-- Footer start -->
  {#if $$slots.footer}
    <div class="group-footer {cssClass}">
      <slot name="footer" />
    </div>
  {/if}
  <!-- Footer end -->
</div>
