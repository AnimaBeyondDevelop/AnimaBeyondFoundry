<script>
  // @ts-nocheck
  let { height, width, edge, border, secondaryColor, children } = $props();
</script>

<div
  class="ribbon"
  style={`
  --height:${height || '60px'};
  --width:${width || '300px'};
  --edge:${edge || '40px'};
  --border:${border || '5px'};
  --color:${secondaryColor ? 'var(--secondary-color)' : 'var(--light-color)'}
`}
>
{#if children}
  {@render children()}
{/if}
</div>

<style lang="scss">
  .ribbon {
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--height);
    width: var(--width);
    position: relative;
    isolation: isolate;
    background: var(--background-color);
    clip-path: polygon(0 0, 100% 0, 100% calc(var(--height)/2), calc(100% - var(--edge)) 100%, var(--edge) 100%, 0 calc(var(--height)/2) );
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
      clip-path: polygon(0 0, 100% 0, 100% calc(var(--height)/2 - var(--border) * 1.5), calc(100% - var(--edge) + var(--border) / 2) 100%, calc(var(--edge) - var(--border) / 2) 100%, 0 calc(var(--height)/2 - var(--border) * 1.5));
      z-index: -1;
      transition:
        height 0.5s ease-in-out,
        width 0.5s ease-in-out,
        clip-path 0.5s ease-in-out;
    }
  }
</style>
