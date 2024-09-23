<script>
  // @ts-nocheck
  let {
    data,
    title,
    height,
    width,
    border,
    secondary,
    children
  } = $props();
</script>

<div
  class="button"
  style={`--height:${height || '50px'};
--width:${width || '50px'};
--border:${border || '5px'};
--color:${secondary ? 'var(--secondary-color)' : 'var(--light-color)'}
`}
>
{#if children}
  {@render children()}
{/if}
</div>

<style lang="scss">
  .button {
    display: grid;
    place-items: center;
    height: var(--height);
    width: var(--width);
    position: relative;
    background: var(--background-color);
    clip-path: circle();
    transition:
      height 0.5s ease-in-out,
      width 0.5s ease-in-out,
      clip-path 0.5s ease-in-out;

    &::before {
      content: '';
      height: calc(var(--height) - var(--border) * 2);
      width: calc(var(--width) - var(--border) * 2);
      position: absolute;
      top: 5px;
      left: 5px;
      background: var(--color);
      clip-path: circle();;
      z-index: -1;
      transition:
        height 0.5s ease-in-out,
        width 0.5s ease-in-out,
        clip-path 0.5s ease-in-out;
    }
  }
</style>
