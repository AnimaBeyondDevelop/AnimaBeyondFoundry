<script>
  /**
   * @typedef {object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<!--
@component
Component implementing a card marker (with a left pointing arrow shape).

Notes:
- It reads styles from `./card.scss`, but their value can overwritten by passings custom css properties
to this component:
```tsx
  <CardMarker --border-color="white">
    ...
  </CardMarker>
```
-->
<div class="marker">
  <div class="content">
    {@render children?.()}
  </div>
</div>

<style lang="scss">
  @use 'card';
  @use 'borders';

  $height: var(--height, 70px);
  $width: var(--width, fit-content);
  $border: card.$border-size;

  .marker {
    width: fit-content;
    @include borders.arrow-shape(
      $height,
      $border,
      'left',
      card.$border-color,
      card.$sidebar-color
    );
    .content {
      @include card.text(light);
      display: flex;
      place-items: center;
      gap: 2px;
      padding-left: calc($height / 3);
    }
  }
</style>
