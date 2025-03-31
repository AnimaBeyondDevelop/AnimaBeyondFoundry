<script>
  import CardButton from './card/cardButton.svelte';

  /**
   * @import { ComponentProps } from 'svelte';
   *
   * @typedef {Object} Props
   * @property {string} icon Name of the icon to be used. This component will load the svg file
   * with the given name from /src/assets/icons/svg. If required, a subfolder can be specified.
   * @property {boolean} value value of the checkbox. It is bindeable and defaults to "false".
   *
   * @typedef {Omit<ComponentProps<typeof CardButton>,keyof Props>} CardButtonProps
   */

  /** @type {Props&CardButtonProps} */
  let { icon, value = $bindable(false), onclick, title, ...rest } = $props();
</script>

<!--
@component
Component implementing a bindable icon checkbox, displaying its value through transparency (solid for true).
Extra attributes are passed on to the <CardButton/> element.

Notes:
- It loads the svg file `/src/assets/icons/svg/{icon}.svg`. Therefore, if the aimed svg is inside a subfolder
it can be specified:
```tsx
  <IconCheckBox icon="critic/cold" />
```
-->
<div class="icon-checkbox" class:off={!value}>
  <CardButton {icon} {title} onclick={() => (value = !value)} {...rest} />
</div>

<style lang="scss">
  @use 'card';

  .icon-checkbox {
    height: 100%;
    aspect-ratio: 1;
    margin: 0;
    padding: 0;
    justify-self: center;
  }

  .off :global {
    .icon {
      opacity: 60%;
    }
  }
</style>
