<script>
  /**
   * @typedef {Object} props Properties for the Group component
   * @property {string} title Title of the group, used for the group header if no group header slot is provided.
   * @property {string} [addRowButtonData=undefined] Data passed to the click event on the add row button.
   * If undefined, no add button is rendered, which is the default.
   * @property {string} [addRowButtonClass=''] CSS class for the add row button. Defaults to ''.
   * @property {string} [cssClass=''] CSS class for the add row button
   * @property {boolean | undefined} [contracted=undefined] Whether the group body is contracted.
   * If `undefined`, the group is assumed to be uncontractible, which is the default.
   * @property {import('svelte').Snippet} [header] Snippet with group header content.
   * When not provided, a default rendering group's title is used.
   * @property {import('svelte').Snippet} buttons Snippet with extra buttons for the group.
   * @property {import('svelte').Snippet} body Snippet with group body content.
   * @property {import('svelte').Snippet} [footer] Optional snippet with group footer content.
   * When not provided, no footer is rendered.
   *
   */

  /** @type {props} */
  let {
    title,
    addRowButtonData = undefined,
    addRowButtonClass = '',
    cssClass = '',
    contracted = $bindable(undefined),
    header = default_header,
    buttons,
    body,
    footer
  } = $props();

  let contractible = $derived(contracted !== undefined);
</script>

<div
  class="common-group {cssClass}"
  class:contractible-group={contractible}
  class:contracted
>
  <div class="group-buttons">
    {#if contractible}
      <i
        class="fas fa-fw fa-chevron-{contracted ? 'down' : 'up'}"
        onclick={() => (contracted = !contracted)}
      >
      </i>
    {/if}

    {#if buttons}
      {@render buttons()}
    {/if}
  </div>

  <!-- Header start -->
  <div class="group-header {cssClass}">
    {#if addRowButtonData}
      <img
        class="{addRowButtonClass} add-button"
        data-on-click={addRowButtonData}
        src="/systems/animabf/assets/icons/game-icons.net/ffffff/sbed/add.svg"
        alt="Add row button"
      />
    {/if}
    {@render header()}
  </div>
  <!-- Header end -->

  <!-- Body start -->
  <div id="{cssClass}-context-menu-container" class="group-body {cssClass}">
    {@render body()}
  </div>
  <!-- Body end -->

  <!-- Footer start -->
  {#if footer}
    <div class="group-footer {cssClass}">
      {@render footer()}
    </div>
  {/if}
  <!-- Footer end -->
</div>

{#snippet default_header()}
  <h3 class="group-header-title">{title}</h3>
{/snippet}
