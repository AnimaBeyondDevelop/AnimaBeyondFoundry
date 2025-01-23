<script>
  // @ts-nocheck
  let { value, modifier = $bindable(0), title, disabled } = $props();

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

<input
  class="input"
  {title}
  {value}
  type="text"
  onfocus={e => e.target.select()}
  {onchange}
  {disabled}
/>

<style lang="scss">
  input[type='text'] {
    all: unset;
    width: var(--input-width, 85px);
    color: white;
    font-size: var(--font-size, 40px);
    -webkit-text-stroke: 4px black;
    paint-order: stroke fill;
    text-align: center;
    &:focus {
      all: unset;
      width: var(--input-width, 85px);
      color: white;
      font-size: var(--font-size, 40px);
      -webkit-text-stroke: 4px black;
      paint-order: stroke fill;
      text-align: center;
    }
  }
</style>
