<script>
  // @ts-nocheck
  let {
    data,
    title,
    size,
    width,
    border,
    secondary,
    children
  } = $props();
</script>

<div
  class="button"
  style={`--size:${size || '50px'};
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
    height: var(--size);
    width: var(--size);
    position: relative;
    background: var(--background-color);
    clip-path: circle();
    transition:
      height 0.5s ease-in-out,
      width 0.5s ease-in-out,
      clip-path 0.5s ease-in-out;

    &::before {
      content: '';
      height: calc(var(--size) - var(--border) * 2);
      width: calc(var(--size) - var(--border) * 2);
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
