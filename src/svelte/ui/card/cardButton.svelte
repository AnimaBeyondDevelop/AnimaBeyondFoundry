<script>
  import { parseCssCustomProperties } from '@svelte/utils';
  import Icon from '../icon.svelte';

  /**
   * @import { FormEventHandler } from "svelte/elements";
   *
   * @typedef Props
   * @property {string} [text]
   * @property {string} [icon]
   * @property {FormEventHandler<HTMLButtonElement>} onclick
   * @property {string} [class]
   * @property {"angled"|"circle"} [shape="angled"]
   * @property {string} [height="60px"]
   * @property {string} [width="fit-content"]
   */

  /** @type {Props} */
  let {
    text = '',
    icon,
    onclick,
    shape = 'angled',
    height,
    width,
    class: cssClass = ''
  } = $props();

  let cssCustomProps = parseCssCustomProperties({ height, width });
</script>

<!--
@component
Button component with card styling. Its shape can be either `circle` or `angled`.

Notes:
- It reads styles from `./card.scss`, but their value can overwritten by passings custom css properties
to this component:
```tsx
  <CardButton text="Attack" shape="angled" height="25px" --border-size=5px />
```
```tsx
  <CardButton icon="point-blank" shape="circle" height="25px" --border-size={0.01 * height} />
```
-->
<button class={cssClass + ' ' + shape} type="button" style={cssCustomProps} {onclick}>
  {#if icon}
    <Icon name={icon} />
  {/if}
  {text}
</button>

<style lang="scss">
  @use 'variable';
  @use 'borders';
  @use 'card' as *;

  $height: var(--height, 60px);
  $width: var(--width, fit-content);

  button {
    height: $height;
    width: $width;

    display: flex;
    flex-direction: row;
    align-items: center;

    @include text();
    @include buttonlike();

    &.angled {
      @include borders.arrow-shape(
        $height,
        $border-size,
        'both',
        $border-color,
        $background-color
      );
      padding-left: calc($height / 2);
      padding-right: calc($height / 2);
    }

    &.circle {
      @include borders.circle($height, $border-size, $border-color, $background-color);
      padding: calc(0.8 * $border-size);
    }
  }
</style>
