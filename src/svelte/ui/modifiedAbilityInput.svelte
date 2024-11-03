<script>
  /**
   * @typedef {Object} props
   * @property {import("@module/common/ModifiedAbility.svelte").ModifiedAbility} ability
   * @property {boolean} [disabled]
   * @property {string} [class] CSS class for the input element
   */

  /** @type {props} */
  let { ability = $bindable(), disabled = false, class: cssClass = '' } = $props();

  ability.addModifier('special', { value: 0 });

  /**
   * @type {import('svelte/elements').FormEventHandler<HTMLInputElement>}
   */
  function onchange(e) {
    e.currentTarget.blur();
    const input = e.currentTarget.value;
    if (['+', '-'].includes(input.slice(0, 1))) {
      ability.modifiers.special.value += parseInt(input);
    } else if (input === '') {
      ability.modifiers.special.value = 0;
    } else {
      ability.modifiers.special.value += parseInt(input) - ability.final;
    }
  }
</script>

<input
  class="input {cssClass}"
  value={ability.final}
  type="text"
  onfocus={e => e.currentTarget.select()}
  {onchange}
  {disabled}
/>

<style lang="scss">
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
</style>
