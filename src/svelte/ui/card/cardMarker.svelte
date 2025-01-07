<script>
  /**
   * @typedef {object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<div class="marker">
  <div class="content">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

<style lang="scss">
  @use 'card';
  @use 'borders';

  $height: var(--height, 70px);
  $width: var(--width, fit-content);
  $border: card.$border-size;

  .marker {
    width: fit-content;
    transition: width 1s ease-in-out;
    @include borders.arrow-shape(
      $height,
      $border,
      'left',
      card.$border-color,
      card.$sidebar-color
    );
    .content {
      @include card.text(light);
      display: flex;
      place-items: center;
      gap: 2px;
      padding-left: calc($height / 3);
    }
  }
</style>
