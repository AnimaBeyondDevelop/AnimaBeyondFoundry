<script>
  import { parseCssCustomProperties } from '@svelte/utils';
  /**
   * @typedef {Object} Props
   * @property {string} icon Name of the icon to be used. This component will load the svg file
   * with the given name from /src/assets/icons/svg. If required, a subfolder can be specified.
   * @property {number} value Current value of the range selector.
   * @property {number} maxValue Maximum value for the range selector.
   * @property {boolean} [disabled=false] Wether the button should be disabled or no. Defaults to false.
   * @property {string} [title] Title given to the button (shown in tooltip).
   * @property {string} [height="30px"] A height for the icons.
   */

  import Icon from './icon.svelte';

  /** @type {Props} */
  let {
    icon,
    value = $bindable(0),
    maxValue,
    title,
    disabled,
    height = '30px'
  } = $props();

  /** @param {number} n */
  function onclick(n) {
    if (value != n) {
      value = n;
    } else {
      value = 0;
    }
  }
  let style = $derived(parseCssCustomProperties({ height }));
</script>

<!--
@component
Component implementing an icon version of a range input, allowing to chose an integer value.

Notes:
- It loads the svg file `/src/assets/icons/svg/{icon}.svg`. Therefore, if the aimed svg is inside a subfolder
it can be specified:
```tsx
  <IconRange icon="critic/cold" bind:value maxValue=10 />
```
-->
<div class="icon-box" {title}>
  {#each { length: maxValue } as _, index}
    {@const v = index + 1}
    <button class:off={value < v} onclick={() => onclick(v)} {disabled}>
      <Icon
        name={icon}
        color="black"
        filling={value < v ? 'transparent' : 'white'}
        {height}
      />
    </button>
  {/each}
</div>

<style lang="scss">
  @use 'card';

  .icon-box {
    display: flex;
    place-content: center;

    :global {
      button {
        height: var(--height);
        margin-inline: 0;
        padding-inline: 0;
        justify-self: right;
      }
      .off {
        opacity: 60%;
      }
    }
  }
</style>
