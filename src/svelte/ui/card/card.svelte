<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [sidebar]
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
      0 1 0 1,
      card.$border-color,
      card.$sidebar-color
    );

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
        width: calc(card.$card-width - card.$border-size - card.$edge-size);
        background: card.$background-color;
      }
    }
  }
</style>
