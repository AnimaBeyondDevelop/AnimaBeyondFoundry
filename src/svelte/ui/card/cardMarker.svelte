<script>
  /**
   * @typedef {object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<div class="marker">
  <div class="marker-body">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

<style lang="scss">
  @use 'variable' as *;

  $direction: var(--direction, 'left');
  $height: var(--height, 80px);
  $width: var(--width, 150px);
  $border: var(--border, 5px);

  @mixin marker-shape($offset: 0px) {
    clip-path: polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%);
  }

  .marker {
    height: $height;
    width: $width;
    position: relative;
    background: $border-color;
    padding: $border;
    @include marker-shape();
    transition: width 1s ease-in-out;

    .marker-body {
      display: flex;
      gap: 8px;
      justify-content: end;
      place-items: center;
      height: calc($height - $border * 2);
      width: calc($width - $border * 2);
      position: absolute;
      top: $border;
      left: $border;
      background: $background-main;
      @include marker-shape();
      transition: width 1s ease-in-out;
      z-index: -1;
    }
  }
</style>
