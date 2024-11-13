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
  @use 'clipping';
  $height: var(--height, 100px);
  $width: var(--width, 100px);
  $border: var(--border, 5px);
  $edge: var(--edge, 40px);
  $bg-color: var(--bg-color, $background-main);
  $border-color: var(--border-color, $border-color);
  $corners: 1 1 0 1;

  .clipped-border {
    position: relative;
    width: $width;
    height: $height;
    background: $border-color;
    @include clipping.slanted-edges($edge, $border, $corners, $outer: 1);
    transition: width 1s ease-in-out;

    &::before {
      content: '';
      position: absolute;
      inset: $border;
      background: $bg-color;
      @include clipping.slanted-edges($edge, $border, $corners);
    }
  }
</style>
