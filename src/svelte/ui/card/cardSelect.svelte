<script>
  import { parseCssCustomProperties } from '@svelte/utils';

  /**
   * @template {{name: string}} T
   * @typedef {object} Props
   * @property {T} value The selected option.
   * @property {T[]} options List of available options.
   * @property {import('svelte').Snippet} [children] A snippet holding extra options.
   * @property {boolean} [disabled] Whether this select is disabled or not.
   * @property {"right"|"left"} [slanted="left"] Which side should have the slanted edge.
   */

  /** @type {Props<{name: string}>} */
  let {
    value = $bindable(),
    options,
    children = undefined,
    disabled = false,
    slanted = 'left'
  } = $props();

  let slantedLeft, slantedRight;
  if (slanted === 'left') {
    slantedLeft = '1';
    slantedRight = '0';
  } else if (slanted === 'right') {
    slantedLeft = '0';
    slantedRight = '1';
  }
  let style = parseCssCustomProperties({ slantedLeft, slantedRight });
</script>

<!--
@component
Select component, with a card-inspired slanted shape.

Notes:
- It reads styles from `./card.scss`, but their value can overwritten by passings custom css properties
to this component:
```tsx
  <script>
    let options = [{name: "first"}, {name: "second"}];
    let value = $state(options[0]);
  </script>
  <CardSelect {options} bind:value --border-size=5px />
```
-->
<div class="card-select" {style}>
  <select disabled={disabled || options.length === 0} bind:value>
    {#each options as option}
      <option value={option}>{option.name}</option>
    {/each}
    {@render children?.()}
  </select>
</div>

<style lang="scss">
  @use 'card';
  @use 'borders';
  .card-select {
    @include card.buttonlike();
    @include borders.slanted-edges(
      0 0 var(--slantedRight) var(--slantedLeft),
      $bg-color: card.$background-light
    );

    height: 100%;
    width: 100%;
    padding: 0 calc(card.$edge-size + 5px);
    align-content: center;
    select {
      cursor: inherit;
      box-shadow: unset;
      border: none;
      appearance: none;
      height: calc(100% - 2 * card.$border-size);
      width: 100%;
      background: card.$background-light;
    }

    option {
      background: white;
      font-size: smaller;
    }
  }
</style>
