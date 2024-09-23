<script>
  // @ts-nocheck
  let { icon, value, invert, title, onClick, noStyle, hidden, disabled } = $props();
  let src = $derived('/systems/animabf/assets/icons/svg/' + icon + '.svg');

  function clickEvent() {
    value = !value;
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
  style={(invert ? '--filter:invert(1);' : '') +
    (noStyle ? '' : !value ? '--opacity:60%;' : '')}
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
    filter: var(--filter);
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
