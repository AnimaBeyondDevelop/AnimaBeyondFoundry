<script>
  // @ts-nocheck
  let { height, width, border, edge, sidebar, rotate, title, titleHeight, titlePosition, fontSize, onClick, secondary, children } = $props();
  
  function clickEvent() {
    onClick?.();
  }

</script>

<div
  class="background"
  style={`--height:${height || '260px'};
  --width:${width || '500px'};
  --border:${border || '5px'};
  --edge:${edge || '40px'};
  --sidebar:${sidebar || '60px'};
  --title-height:${titleHeight || '40px'};
  --font-size:${fontSize || '28px'};
  --font-color:${secondary ? 'var(--secondary-text-color)' : 'var(--main-text-color)'};
  --color:${secondary ? 'var(--secondary-color)' : 'var(--light-color)'};
  --title-position:${titlePosition ? 'calc(var(--height) - var(--title-height))' : ''};
  --hover-scale:${onClick ? '1.05' : ''};
  --cursor:${onClick ? 'pointer' : 'auto'};`}
>
  <div class="container">
    {#if children}
      {@render children()}
    {/if}
  </div>
  {#if title}
    <div class="title" style={titlePosition?'--transform:rotate(180deg)':''}>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <span onclick={clickEvent}>{title}</span>
    </div>
  {/if}
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
      100% calc(var(--height) - var(--edge)),
      calc(var(--width) - var(--edge)) 100%,
      var(--edge) 100%,
      0 calc(var(--height) - var(--edge))
    );
    position: relative;
    isolation: isolate;
    transition:
      height 1s ease-in-out,
      width 1s ease-in-out,
      clip-path 1s ease-in-out;
    transform: var(--transform);

    &::before {
      content: '';
      height: calc(var(--height) - var(--border) * 2);
      width: calc(var(--width) - var(--border) * 2);
      position: absolute;
      top: var(--border);
      left: calc(var(--border));
      background: var(--secondary-color);
      clip-path: polygon(
        0 0,
        calc(var(--width) - var(--edge) - var(--border) * 2 + var(--border) / 2) 0,
        100% calc(var(--edge) - var(--border) / 2),
        100% calc(var(--height) - var(--edge) - var(--border) * 2 + var(--border) / 2),
        calc(var(--width) - var(--edge) - var(--border) * 2 + var(--border) / 2) 100%,
        calc(var(--edge) - var(--border) / 2) 100%,
        0 calc(var(--height) - var(--edge) - var(--border) * 2 + var(--border) / 2)
      );
      transition:
        height 1s ease-in-out,
        width 1s ease-in-out,
        left 1s ease-in-out,
        clip-path 1s ease-in-out;
    }
  }
  .container{
    height: var(--height);
    width: calc(var(--width) - var(--sidebar) * 2);
    background: var(--background-color);
    clip-path: polygon(
      0 0,
      100% 0,
      100% 100%,
      0 100%,
    );
    position: absolute;
    left: calc(var(--sidebar));
    transition:
      height 1s ease-in-out,
      width 1s ease-in-out,
      left 1s ease-in-out,
      clip-path 1s ease-in-out;

    &::before {
      content: '';
      height: calc(var(--height) - var(--border) * 2);
      width: calc(var(--width) - var(--sidebar) * 2 - var(--border) * 2);
      position: absolute;
      top: var(--border);
      left: calc(var(--border));
      background: var(--main-color);
      clip-path: polygon(
        0 0,
        100% 0,
        100% 100%,
        0 100%,
      );
      transition:
        height 1s ease-in-out,
        width 1s ease-in-out,
        left 1s ease-in-out,
        clip-path 1s ease-in-out;
    }
  }
  .title {
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--title-height);
    width: calc(var(--width) - var(--edge) * 2);
    background: var(--background-color);
    clip-path: polygon(
      0 0,
      100% 0,
      100% calc(var(--title-height) / 2),
      calc(100% - var(--title-height) / 2) 100%,
      calc(var(--title-height) / 2) 100%,
      0 calc(var(--title-height) / 2)
    );
    position: absolute;
    left: calc(var(--edge));
    top: var(--title-position);
    transition:
      height 1s ease-in-out,
      width 1s ease-in-out,
      top 1s ease-in-out,
      left 1s ease-in-out,
      clip-path 1s ease-in-out;
    transform: var(--transform);

    &::before {
      content: '';
      height: calc(var(--title-height) - var(--border) * 2);
      width: calc(var(--width) - var(--edge) * 2 - var(--border) * 2);
      position: absolute;
      top: var(--border);
      left: calc(var(--border));
      background: var(--color);
      clip-path: polygon(
        0 0,
        100% 0,
        100% calc(var(--title-height) / 2 - var(--border) * 2 + var(--border) / 2),
        calc(100% - var(--title-height) / 2 + var(--border) / 2) 100%,
        calc(var(--title-height) / 2 - var(--border) / 2) 100%,
        0 calc(var(--title-height) / 2 - var(--border) * 2 + var(--border) / 2)
      );
      transition:
        height 1s ease-in-out,
        width 1s ease-in-out,
        top 1s ease-in-out,
        left 1s ease-in-out,
        clip-path 1s ease-in-out;
    }
    span{
      position: absolute;
      cursor: var(--cursor, auto);
      font-size: var(--font-size);
      color: var(--font-color);
      transform: var(--transform-text);
      transition: scale 0.3s ease-out;
      &:hover {
        scale: var(--hover-scale, 1);
      }
    }
  }
</style>
