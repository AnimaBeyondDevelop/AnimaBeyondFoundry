<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [sidebar]
   * @property {import('svelte').Snippet} [body]
   * @property {import('svelte').Snippet|boolean} [sidebarRight]
   * @property {import('svelte').Snippet|string} [header]
   * @property {import('svelte').Snippet|string} [footer]
   * @property {string} [slantedCorners="0 1 0 1"]
   * @property {string} [class] Css class to apply to the card outer div
   */

  /** @type {Props} */
  let {
    sidebar,
    body,
    sidebarRight,
    header,
    footer,
    slantedCorners = '0 1 0 1',
    class: cssClass
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
<div class="card-border text-dark {cssClass}" style={cssCorners}>
  <div class="content">
    <div class="sidebar text-light">
      {@render sidebar?.()}
    </div>
    <div class="separator"></div>
    <div class="card-body" class:has-header={!!header} class:has-footer={!!footer}>
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
  {:else if header}
    <div class="header">
      {@render header()}
    </div>
  {/if}
  {#if typeof footer === 'string'}
    <div class="footer">
      <div>{footer}</div>
    </div>
  {:else if footer}
    <div class="footer">
      {@render footer()}
    </div>
  {/if}
</div>

{#snippet empty()}{/snippet}

<style lang="scss">
  @use 'variable' as *;
  @use 'borders';
  @use 'card';

  $header-height: var(--header-height, card.$title-height);
  $footer-height: var(--footer-height, card.$title-height);

  .has-header {
    padding-top: $header-height;
  }
  .has-footer {
    padding-bottom: $footer-height;
  }

  .card-border {
    height: card.$card-height;
    width: card.$card-width;
    // bg-color set to sidebar-color to avoid a 1px diagonal line on slanted bottom-left corner
    @include borders.slanted-edges(
      var(--slanted0) var(--slanted1) var(--slanted2) var(--slanted3),
      $bg-color: card.$sidebar-color
    );

    .content {
      display: flex;

      .sidebar {
        flex-shrink: 0;
        place-items: center;
        justify-content: end;
        width: card.$sidebar-size;
        background: card.$sidebar-color;
      }

      .separator {
        background-color: card.$border-color;
        width: card.$border-size;
        flex-shrink: 0;
      }

      .card-body {
        background: card.$background-color;
        flex: 1;
        min-width: 0;
      }
    }

    .footer,
    .header {
      position: absolute;
      left: card.$edge-size;
      right: card.$edge-size;
      & > div {
        text-align: center;
        align-content: center;
        height: 100%;
        width: 100%;
      }
    }

    .header {
      top: 0;
      height: $header-height;
      & > div {
        @include borders.slanted-edges(
          0 0 1 1,
          $edge: calc(card.$sidebar-size - card.$edge-size + card.$border-size),
          $bg-color: card.$background-light
        );
        padding: 0;
      }
    }
    .footer {
      bottom: 0;
      height: $footer-height;
      & > div {
        @include borders.slanted-edges(
          1 1 0 0,
          $edge: calc(card.$sidebar-size - card.$edge-size + card.$border-size),
          $bg-color: card.$background-light
        );
        padding: 0;
      }
    }
  }
</style>
