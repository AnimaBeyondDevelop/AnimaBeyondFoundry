<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} sidebar
   * @property {import('svelte').Snippet} body
   */

  /** @type {Props} */
  let { sidebar, body } = $props();
</script>

<div class="card-border">
  <div class="content">
    <div class="sidebar">
      {@render sidebar?.()}
    </div>
    <div class="separator"></div>
    <div class="card-body">
      {@render body?.()}
    </div>
  </div>
</div>

<style lang="scss">
  @use 'variable' as *;
  @use 'borders';

  $height: var(--height, 260px);
  $width: var(--width, 500px);
  $border: var(--border, 5px);
  $border-color: var(--border-color, $border-color);
  $bg-color: var(--bg-color, $background-main);
  $sidebar-color: var(--sidebar-color, $background-secondary);
  $edge: var(--edge, 40px);
  $sidebar: var(--sidebar, 60px);

  .card-border {
    height: $height;
    width: $width;
    @include borders.slanted-edges($edge, $border, 0 1 0 1);

    .content {
      display: flex;

      .sidebar {
        flex-shrink: 0;
        grid-area: 1 / 1 / span 4;
        grid-template: 30px 30px 40px 55px 40px / 1fr;
        padding: 15px;
        display: grid;
        gap: 5px;
        place-items: center;
        justify-content: end;
        height: calc($height - $border * 2);
        width: $sidebar;
        background: $sidebar-color;
      }

      .separator {
        background-color: $border-color;
        width: $border;
        flex-shrink: 0;
      }

      .card-body {
        width: calc($width - $border - $edge);
        background: $bg-color;
      }
    }
  }
</style>
