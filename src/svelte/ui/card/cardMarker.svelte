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
  @use 'variable' as *;
  @use 'borders';

  $direction: var(--direction, 'left');
  $height: var(--height, 80px);
  $width: var(--width, 150px);
  $border: var(--border, 5px);

  @mixin marker-shape($offset: 0px) {
    clip-path: polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%);
  }

  .marker {
    width: $width;
    @include borders.arrow-shape($height, $border, 'left');
  }
</style>
