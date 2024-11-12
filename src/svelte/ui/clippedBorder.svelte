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
  @use 'sass:list';
  $height: var(--height, 100px);
  $width: var(--width, 100px);
  $border: var(--border, 5px);
  $edge: var(--edge, 40px);
  $bg-color: var(--bg-color, $background-main);
  $border-color: var(--border-color, $border-color);

  @function corner($coord-x, $coord-y, $slant-param) {
    @if $coord-x != $coord-y {
      @return (
        calc($coord-x - $slant-param) $coord-y,
        $coord-x calc($coord-y + $slant-param)
      );
    }
    @return (
      $coord-x calc($coord-y + $slant-param),
      calc($coord-x + $slant-param) $coord-y
    );
  }

  @mixin slanted-clip($edge, $border, $corners: 0 1 1 1, $outer: 0) {
    $offset: calc(($border * sqrt(2) - 2 * $border) * $outer);
    $slant-param: calc($edge - $offset);
    $clip: polygon(
      corner(0%, 0%, calc(list.nth($corners, 1) * $slant-param)),
      corner(100%, 0%, calc(list.nth($corners, 2) * $slant-param)),
      corner(100%, 100%, calc(-1 * list.nth($corners, 3) * $slant-param)),
      corner(0%, 100%, calc(-1 * list.nth($corners, 4) * $slant-param))
    );
    -webkit-clip-path: $clip;
    clip-path: $clip;
  }

  .clipped-border {
    position: relative;
    width: $width;
    height: $height;
    background: $border-color;
    @include slanted-clip($edge, $border, $outer: 1);
    transition: width 1s ease-in-out;

    &::before {
      content: '';
      position: absolute;
      inset: $border;
      background: $bg-color;
      @include slanted-clip($edge, $border);
    }
  }
</style>
