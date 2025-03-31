<script>
  import CardButton from './card/cardButton.svelte';

  /**
   * @import { ComponentProps } from 'svelte';
   *
   * @template T Value of the options
   * @typedef {Object} IconSwitchOptions
   * @property {string} icon Icon for this option
   * @property {T} value Value for this option
   * @property {string} [title] A specific title to show when this option is selected
   */

  /**
   * @template [T=*]
   * @typedef {Object} Props
   * @property {IconSwitchOptions<T>[]} options List of available options
   * @property {T} value Selected value
   *
   * @typedef {Omit<ComponentProps<typeof CardButton>,keyof Props>} CardButtonProps
   */

  /** @type {Props&CardButtonProps} */
  let {
    options,
    value = $bindable(options[0].value),
    onclick,
    title,
    ...rest
  } = $props();

  let iconIterator = {
    get index() {
      return options.findIndex(o => o.value === value);
    },
    set index(n) {
      value = options[n % options.length].value;
    },
    get current() {
      return options[this.index];
    },
    get title() {
      return this.current.title ?? title ?? '';
    },
    next() {
      this.index++;
    },
    prev() {
      // Doing `this.index--` fails when i=0, since (0 - 1) % n = -1. However (0 + n - 1) % n = n - 1 and
      // (i - 1) % n = (i + n - 1) % n for i > 0.
      this.index = this.index + options.length - 1;
    }
  };
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
<CardButton
  icon={iconIterator.current.icon}
  onclick={e => {
    iconIterator.next();
    onclick?.(e);
  }}
  oncontextmenu={e => {
    e.preventDefault();
    iconIterator.prev();
  }}
  title={iconIterator.title}
  {...rest}
/>
