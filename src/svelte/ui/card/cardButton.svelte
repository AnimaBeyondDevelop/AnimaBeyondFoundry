<script>
  import { parseCssCustomProperties } from '@svelte/utils';
  import Icon from '../icon.svelte';

  /**
   * @import { HTMLButtonAttributes } from "svelte/elements";
   * @import { Snippet } from "svelte";
   *
   * @typedef Props
   * @property {Snippet} [children]
   * @property {string} [icon]
   * @property {string} [class]
   * @property {"angled"|"circle"} [shape]
   * @property {"dark"|"light"|"default"} [style="default"]
   * @property {string} [height="60px"]
   * @property {string} [width="fit-content"]
   */

  /** @type {Props&Partial<HTMLButtonAttributes>} */
  let {
    children,
    icon,
    shape,
    style = 'default',
    height,
    width,
    class: cssClass = '',
    onclick,
    ...rest
  } = $props();

  let cssCustomProps = parseCssCustomProperties({
    'cardbutton-height': height,
    'cardbutton-width': width
  });
</script>

<!--
@component
Button component with card styling. Its shape can be either `circle`, `angled` or `undefined`.
Extra attributes are passed on to the <button/> element.

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
<button
  class={[cssClass, shape, style].join(' ')}
  class:noninteractive={rest.disabled || !onclick}
  style={cssCustomProps}
  {onclick}
  {...rest}
>
  {#if icon}
    <Icon name={icon} class="content" />
  {/if}
  {@render children?.()}
</button>

<style lang="scss">
  @use 'variable';
  @use 'borders';
  @use 'card';

  $height: var(--cardbutton-height, 100%);
  $width: var(--cardbutton-width, fit-content);

  button {
    height: $height;
    width: $width;
    margin: 0;
    padding: 0;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    &.light {
      --background-color: #{variable.$background-light};
      color: card.$text-color;
    }
    &.dark {
      --background-color: #{variable.$background-secondary};
      color: card.$text-color-light;
    }

    &.angled {
      @include borders.arrow-shape($height, 'both');
      padding-left: calc($height / 2);
      padding-right: calc($height / 2);
    }

    &.circle {
      @include borders.circle($height);
      padding: calc(0.15 * $height);
    }
  }
</style>
