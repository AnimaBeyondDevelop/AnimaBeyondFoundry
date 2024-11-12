<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} sidebar
   * @property {import('svelte').Snippet} body
   * @property {import('svelte').Snippet} buttons
   */

  /** @type {Props} */
  let { sidebar, body, buttons } = $props();
</script>

<div class="card">
  <div class="sidebar">
    {@render sidebar()}
  </div>
  <div class="card-body">
    {@render body()}
  </div>
  <div class="buttons">
    {@render buttons()}
  </div>
</div>

<style lang="scss">
  $height: var(--height, 260px);
  $width: var(--width, 500px);
  $border: var(--border, 5px);
  $edge: var(--edge, 40px);
  $sidebar: var(--sidebar, 60px);
  $clip: polygon(
    0 0,
    (100% - $edge) 0,
    100% $edge,
    100% 100%,
    $edge 100%,
    0 (100% - $edge)
    );
  $bg-color: var(--background-color, $background-main);

  .card {
    height: $height;
    width: $width;
    background: $border-color;
    position: relative;
    clip-path: $clip;

    &::before {
      content: '';
      position: abosolute;
      inset: $border;
      clip-path: $clip;
      background-color: $bg-color;
    }
    .card {
      gap: $border;
      height: 100%;
      width: 100%;

      .sidebar {
        grid-area: 1 / 1 / span 4;
        grid-template: 30px 30px 40px 55px 40px / 1fr;
        padding: 15px;
        display: grid;
        gap: 5px;
        place-items: center;
        justify-content: end;
        height: calc($height - $border * 2);
        width: $sidebar;
        background: $background-secondary;
      }

      .card-body {
        height: calc($height - 2 * $border);
        width: calc($width - $sidebar - 3 * $border);
        background: $background-main;
        padding: 15px;
      }

      .buttons {
        grid-area: 4 / 3 / 5 / 5;
        justify-self: end;
        align-self: center;
        margin-right: -25px;
      }
    }
  }
</style>
