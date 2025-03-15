<script>
  import CardButton from './card/cardButton.svelte';
  import Icon from './icon.svelte';

  /**
   * @import { ComponentProps } from 'svelte';
   *
   * @template T Value of the options
   * @typedef {Object} IconSelectOptions
   * @property {string} icon Icon for this option
   * @property {T} value Value for this option
   * @property {string} [title] A specific title for this option
   */

  /**
   * @template [T=*]
   * @typedef {Object} Props
   * @property {IconSelectOptions<T>[]} options List of available options
   * @property {T} value Selected value
   * @property {boolean} [dropdown] Whether a dropdown instead of an array of icons should be used for
   * selection. Defaults to `false`.
   *
   * @typedef {Omit<ComponentProps<typeof CardButton>,keyof Props>} CardButtonProps
   */

  /** @type {Props&Omit<CardButtonProps,'onclick'>} */
  let {
    options,
    value = $bindable(options[0].value),
    dropdown = false,
    title,
    height,
    class: cssClass,
    ...rest
  } = $props();
</script>

<!--
@component
Component implementing a bindable icon switch. Options can be cycled using left and right mouse clicks.
Extra attributes are passed on to the <CardButton/> element.

Notes:
- It loads the svg file `/src/assets/icons/svg/{icon}.svg`. Therefore, if the aimed svg is inside a subfolder
it can be specified:
```tsx
  <IconSwitch
    bind:value
    options={[{value: "cold", icon: "critic/cold"}, {value: 'cut', icon: "critics/cut"}]}
  />
```
-->
<div class="icon-select class={cssClass}" {title} style:height>
  {#if dropdown}
    <select>
      {#each options as option}
        <option value={option.value}>
          <Icon name={option.icon} />
          {option.title}
        </option>
      {/each}
    </select>
  {:else}
    {#each options as option}
      <CardButton
        class={option.value === value ? 'active' : ''}
        icon={option.icon}
        onclick={() => (value = option.value)}
        title={option.title}
        {...rest}
      />
    {/each}
  {/if}
</div>

<style lang="scss">
  .icon-select {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;

    :global {
      button {
        opacity: 60%;
        &.active {
          opacity: 100%;
        }
      }
    }
  }
</style>
