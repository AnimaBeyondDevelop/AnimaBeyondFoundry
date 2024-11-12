<script>
  /**
   * @typedef Props
   * @property {import('svelte').Snippet} [children]
   * @property {string} [class] CSS Class to apply to the outermost element (i.e., the border div).
   */

  /** @type {Props} */
  let { children, class: cssClass = '' } = $props();
</script>

<div class="clipped-border {cssClass}" style:--bg-color="pink">
  {@render children?.()}
</div>

<style lang="scss">
  $height: var(--height, 100px);
  $width: var(--width, 100px);
  $border: var(--border, 5px);
  $edge: var(--edge, 40px);
  $clip: var(--clipp, polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%));
  $bg-color: var(--bg-color, $background-main);
  $border-color: var(--border-color, $border-color);

  @mixin card-clip($edge, $border, $outer: 0) {
    $offset: calc(($border * sqrt(2) - 2 * $border) * $outer);
    $clip: polygon(
      calc($edge - $offset) 0,
      calc(100% - $edge + $offset) 0,
      100% calc($edge - $offset),
      100% calc(100% - $edge + $offset),
      calc(100% - $edge + $offset) 100%,
      calc($edge - $offset) 100%,
      0 calc(100% - $edge + $offset),
      0 calc($edge - $offset)
    );
    -webkit-clip-path: $clip;
    clip-path: $clip;
  }

  .clipped-border {
    position: relative;
    width: $width;
    height: $height;
    background: $border-color;
    @include card-clip($edge, $border, 1);
    transition: width 1s ease-in-out;

    &::before {
      content: '';
      position: absolute;
      inset: $border;
      background: $bg-color;
      @include card-clip($edge, $border);
      // transition: width 1s ease-in-out;
    }
  }
</style>
