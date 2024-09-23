<script>
  // @ts-nocheck
  let {
    data,
    title,
    onClick,
    height,
    width,
    border,
    edge,
    fontSize,
    fontColor,
    color,
    secondary
  } = $props();
</script>

<div
  class="button"
  style={`--height:${height || '60px'};
--width:${width || '220px'};
--border:${border || '5px'};
--edge:${edge || '25px'};
--font-size:${fontSize || '34px'};
--font-color:${secondary ? 'var(--secondary-text-color)' : 'var(--main-text-color)'};
--color:${secondary ? 'var(--secondary-color)' : 'var(--light-color)'}
`}
>
  <button data-id={data} type="button" onclick={onClick}>{title}</button>
</div>

<style lang="scss">
  .button {
    display: grid;
    place-items: center;
    height: var(--height);
    width: var(--width);
    position: relative;
    background: var(--background-color);
    clip-path: polygon(
      calc(var(--edge) + var(--border) / 2) 0,
      calc(100% - calc(var(--edge) + var(--border) / 2)) 0,
      100% calc(var(--height) / 2),
      calc(100% - calc(var(--edge) + var(--border) / 2)) 100%,
      calc(var(--edge) + var(--border) / 2) 100%,
      0 calc(var(--height) / 2)
    );
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
      clip-path: polygon(
        var(--edge) 0,
        calc(100% - var(--edge)) 0,
        calc(100% - calc(var(--edge) / 10)) calc((var(--height) - var(--border) * 2) / 2),
        calc(100% - var(--edge)) 100%,
        var(--edge) 100%,
        calc(var(--edge) / 10) calc((var(--height) - var(--border) * 2) / 2)
      );
      z-index: -1;
      transition:
        height 0.5s ease-in-out,
        width 0.5s ease-in-out,
        clip-path 0.5s ease-in-out;
    }

    button {
      width: auto;
      border: none;
      background: none;
      font-size: var(--font-size);
      color: var(--font-color);
      cursor: pointer;
      transition: font-size 0.2s;
      &:hover {
        box-shadow: none;
        font-size: calc(var(--font-size) - 2px);
      }
      &:focus {
        box-shadow: none;
      }
    }
  }
</style>
