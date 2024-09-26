<script>
  // @ts-nocheck
  let {
    height,
    width,
    border,
    children
  } = $props();

</script>

<div class="marker"
style={`--height:${height || '80px'};
--width:${width || '150px'};
--border:${border || '5px'};`}>
  <div class="body">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

<style lang="scss">
  .marker {
    height: var(--height);
    width: var(--width);
    position: relative;
    background: black;
    clip-path: polygon(37px 0, 100% 0, 100% 100%, 37px 100%, 0 40px);
    transition: width 1s ease-in-out;

    .body {
      display: grid;
      grid-template-rows: 1fr;
      gap: 8px;
      justify-content: end;
      place-items: center;
      height: calc(var(--height) - var(--border) * 2);
      width: calc(var(--width) - var(--border) * 2);
      position: absolute;
      top: var(--border);
      left: var(--border);
      background: rgb(45, 45, 45);
      clip-path: polygon(35px 0, 100% 0, 100% 100%, 35px 100%, 3px 35px);
      transition: width 1s ease-in-out;
      z-index: -1;
    }
  }
</style>
