<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [sidebar]
   * @property {import('svelte').Snippet} [body]
   * @property {import('svelte').Snippet|boolean} [sidebarRight]
   * @property {import('svelte').Snippet|string} [header]
   * @property {import('svelte').Snippet|string} [footer]
   * @property {string} [slantedCorners="0 1 0 1"]
   */

  /** @type {Props} */
  let {
    sidebar,
    body,
    sidebarRight,
    header,
    footer,
    slantedCorners = '0 1 0 1'
  } = $props();

  // Allow to specify <Card sidebarRight> ... </Card> to add an empty right sidebar
  if (sidebarRight === true) {
    sidebarRight = empty;
  }

  let cssCorners = slantedCorners
    .split(' ')
    .map((value, index) => `--slanted${index}:${value};`)
    .join('');
</script>

<!--
@component
Card component. It defines a slanted card shape, with a sidebar and a body snippets.

Notes:
- It reads styles from `./card.scss`, but their value can overwritten by passings custom css properties
to this component:
```tsx
  <Card {body} {sidebar} --border-size=5px />
```
```tsx
  <Card --width=300px --border-size=10px >
    {#snippet sidebar()}
      <Icon name="dice" />
    {/snippet}

    {#snippet body()}
      <h1> Card title </h1>
    {/snippet}
  </Card>
```
-->
<div class="card-border" style={cssCorners}>
  <div class="content">
    <div class="sidebar">
      {@render sidebar?.()}
    </div>
    <div class="separator"></div>
    <div class="card-body">
      {@render body?.()}
    </div>
    {#if sidebarRight}
      <div class="separator"></div>
      <div class="sidebar">
        {@render sidebarRight()}
      </div>
    {/if}
  </div>
  {#if typeof header === 'string'}
    <div class="header">
      <div>{header}</div>
    </div>
  {:else}
    <div class="header">
      {@render header?.()}
    </div>
  {/if}
  {#if typeof footer === 'string'}
    <div class="footer">
      <div>{footer}</div>
    </div>
  {:else}
    <div class="footer">
      {@render footer?.()}
    </div>
  {/if}
</div>

{#snippet empty()}{/snippet}

<style lang="scss">
  @use 'variable' as *;
  @use 'borders';
  @use 'card';

  .card-border {
    height: card.$card-height;
    width: card.$card-width;
    // bg-color set to sidebar-color to avoid a 1px diagonal line on slanted bottom-left corner
    @include borders.slanted-edges(
      card.$edge-size,
      card.$border-size,
      var(--slanted0) var(--slanted1) var(--slanted2) var(--slanted3),
      card.$border-color,
      card.$sidebar-color
    );
    @include card.text(dark);

    .content {
      display: flex;

      .sidebar {
        @include card.text(light);
        flex-shrink: 0;
        grid-area: 1 / 1 / span 4;
        grid-template: 30px 30px 40px 55px 40px / 1fr;
        padding: 15px;
        display: grid;
        gap: 5px;
        place-items: center;
        justify-content: end;
        height: calc(card.$card-height - card.$border-size * 2);
        width: card.$sidebar-size;
        background: card.$sidebar-color;
      }

      .separator {
        background-color: card.$border-color;
        width: card.$border-size;
        flex-shrink: 0;
      }

      .card-body {
        width: 100%;
        background: card.$background-color;
      }
    }

    .footer,
    .header {
      position: absolute;
      left: card.$edge-size;
      right: card.$edge-size;
      height: calc(card.$sidebar-size - card.$edge-size + 20px);
      & > div {
        text-align: center;
        height: 100%;
        width: 100%;
      }
    }

    .header {
      top: 0;
      & > div {
        @include borders.slanted-edges(
          calc(card.$sidebar-size - card.$edge-size + card.$border-size),
          card.$border-size,
          0 0 1 1,
          card.$border-color,
          card.$background-light
        );
        padding: 0;
      }
    }
    .footer {
      bottom: 0;
      & > div {
        @include borders.slanted-edges(
          calc(card.$sidebar-size - card.$edge-size + card.$border-size),
          card.$border-size,
          1 1 0 0,
          card.$border-color,
          card.$background-light
        );
        padding: 0;
      }
    }
  }
</style>
