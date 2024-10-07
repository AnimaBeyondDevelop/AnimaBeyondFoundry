<script>
  // @ts-nocheck
  let {
    icon,
    value,
    modifier = $bindable(0),
    title,
    clickEvent,
    invert,
    disabled
  } = $props();
  let src = $derived('/systems/animabf/assets/icons/svg/' + icon + '.svg');

  function onchange(e) {
    e.target.blur();
    const input = e.target.value;
    if (['+', '-'].includes(input.slice(0, 1))) {
      modifier += parseInt(input);
    } else if (input === '') {
      modifier = 0;
    } else {
      modifier += parseInt(input) - value;
    }
  }
</script>

<div class="content">
  <input
    class="icon"
    type="image"
    {title}
    {src}
    alt=""
    onclick={clickEvent}
    style={(invert ? '--filter:invert(1);' : '') +
      (clickEvent ? '--hover-scale:1.05' : '')}
  />
  <input
    class="input"
    {value}
    type="text"
    onfocus={e => e.target.select()}
    {onchange}
    {disabled}
  />
</div>

<style lang="scss">
  .content {
    width: 140px;
    display: grid;
    grid-template: 1fr/0.6fr 1fr;
    place-items: center;
    gap: 0.2rem;

    .icon {
      height: var(--icon-size, 35px);
      justify-self: right;
      transition: var(--transition, scale 0.3s ease-out, transform 0.4s ease-out);
      transform: var(--transform);
      opacity: var(--opacity);
      filter: var(--filter);
      &:hover {
        scale: var(--hover-scale, 1);
      }
    }

    .input {
      all: unset;
      width: 85px;
      color: white;
      font-size: 40px;
      -webkit-text-stroke: 4px black;
      paint-order: stroke fill;
      text-align: center;
      &:focus {
        all: unset;
        width: 85px;
        color: white;
        font-size: 40px;
        -webkit-text-stroke: 4px black;
        paint-order: stroke fill;
        text-align: center;
      }
    }
  }
</style>
