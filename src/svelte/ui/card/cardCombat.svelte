<script>
  // @ts-nocheck
  let { height, width, border, edge, sidebar, children } = $props();
</script>

<div
  class="background"
  style={`--height:${height || '260px'};
  --width:${width || '500px'};
  --border:${border || '5px'};
  --edge:${edge || '40px'};
  --sidebar:${sidebar || '60px'};`}
>
  <div class="sidebar">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

<style lang="scss">
  .background {
    height: var(--height);
    width: var(--width);
    background: var(--background-color);
    clip-path: polygon(
      0 0,
      calc(var(--width) - var(--edge)) 0,
      100% var(--edge),
      100% 100%,
      var(--edge) 100%,
      0 calc(var(--height) - var(--edge))
    );
    position: relative;
    isolation: isolate;
    transition:
      height 1s ease-in-out,
      width 1s ease-in-out,
      clip-path 1s ease-in-out;

    &::before {
      content: '';
      height: calc(var(--height) - var(--border) * 2);
      width: calc(var(--width) - var(--sidebar) - var(--border) * 3);
      position: absolute;
      top: var(--border);
      left: calc(var(--sidebar) + var(--border) * 2);
      background: var(--main-color);
      clip-path: polygon(
        0 0,
        calc(
            var(--width) - var(--sidebar) - var(--border) * 3 - var(--edge) +
              var(--border) / 2
          )
          0,
        100% calc(var(--edge) - var(--border) / 2),
        100% 100%,
        0 100%
      );
      transition:
        height 1s ease-in-out,
        width 1s ease-in-out,
        left 1s ease-in-out,
        clip-path 1s ease-in-out;
    }

    .sidebar {    
      display: grid;
      grid-template: 1fr / 150px 60px;
      justify-content: end;
      height: calc(var(--height) - var(--border) * 2);
      width: var(--sidebar);
      position: absolute;
      top: var(--border);
      left: var(--border);
      background: var(--secondary-color);
      clip-path: polygon(
        0 0,
        100% 0,
        100% 100%,
        calc(var(--edge) - var(--border) / 2) 100%,
        0 213px
      );
      transition: width 1s ease-in-out;
    }
  }
</style>
