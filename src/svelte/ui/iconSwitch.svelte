<script>
  // @ts-nocheck
  let { icons, value, options, invert, title, onClick, noStyle, hidden, disabled } =
    $props();
  let src = $derived(
    '/systems/animabf/assets/icons/svg/' + icons[options.indexOf(value)] + '.svg'
  );

  function clickEvent() {
    value = options[(options.indexOf(value) + 1) % options.length];
    onClick?.(value);
  }
</script>

<input
  {hidden}
  class="icon"
  type="image"
  {title}
  {src}
  alt=""
  onclick={clickEvent}
  {disabled}
  style={noStyle ? '' : invert ? '--filter-invert:invert(1);' : ''}
/>

<style lang="scss">
  .icon {
    width: var(--icon-size, 35px);
    height: var(--icon-size, 35px);
    margin: var(--icon-margin, 0px);
    justify-self: center;
    transition: var(--transition, scale 0.3s ease-out, transform 0.4s ease-out);
    transform: var(--transform);
    opacity: var(--opacity);
    filter: var(--filter-invert);
    &:hover {
      scale: 1.05;
    }
    &:disabled {
      &:hover {
        scale: 1;
      }
    }
  }
</style>
