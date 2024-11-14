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

<div class="card"></div>

<div class="card2"></div>

<style lang="scss">
  @use 'borders';
  $height: var(--height, 100px);
  $width: var(--width, 100px);
  $border: var(--border, 5px);
  $edge: var(--edge, 40px);

  $corners: 0 0 0 1;

  .clipped-border {
    width: $width;
    transition: width 1s ease-in-out;

    @include borders.arrow-shape(80px, $border);
  }

  .card {
    margin: 10px;
    width: $width;
    height: $height;
    @include borders.slanted-edges($edge, $border, $corners);
  }
</style>
