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

<div class="card-container">
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

  <div class="buttons">
    {@render buttons?.()}
  </div>
</div>

<style lang="scss">
  @use 'borders';

  $height: var(--height, 260px);
  $width: var(--width, 500px);
  $border: var(--border, 5px);
  $border-color: var(--border-color, $border-color);
  $edge: var(--edge, 40px);
  $sidebar: var(--sidebar, 60px);

  .card-container :global {
    width: fit-content;
    height: fit-content;
    position: relative;

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
          background: $background-secondary;
        }

        .separator {
          background-color: $border-color;
          width: $border;
          flex-shrink: 0;
        }

        .card-body {
          width: calc($width - $border - $edge);
        }
      }
    }

    .buttons {
      position: absolute;
      bottom: calc(($border - $edge) / 2);
      right: calc(($border - $edge) / 2);
      grid-area: 4 / 3 / 5 / 5;
      justify-self: end;
      align-self: center;

      button {
        min-width: calc(3 * $edge);
        @include borders.arrow-shape($edge, $border);
      }
    }
  }
</style>
