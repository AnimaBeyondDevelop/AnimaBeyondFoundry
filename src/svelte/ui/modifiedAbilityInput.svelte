<script>
  import Input from './input.svelte';

  /**
   * @typedef {Object} props
   * @property {import("@module/common/ModifiedAbility.svelte").ModifiedAbility} ability
   * @property {boolean} [disabled]
   * @property {string} [class] CSS class for the input element
   */

  /** @type {props} */
  let { ability = $bindable(), disabled = false, class: cssClass = '' } = $props();

  let showSpecial = $state(false);
  let operationSign = $state('+');

  $effect(() => {
    if (!ability.modifiers.special) {
      ability.addModifier('special', { value: 0 });
    }
  });
  /**
   * @type {import('svelte/elements').FormEventHandler<HTMLInputElement>}
   */
  function onchange(e) {
    e.currentTarget.blur();
    const input = e.currentTarget.value;
    if (input === '') {
      ability.modifiers.special.value = 0;
    } else if (['+', '-'].includes(operationSign)) {
      ability.modifiers.special.value = parseInt(operationSign + input);
    } else {
      ability.modifiers.special.value += parseInt(input) - ability.final;
    }
    operationSign = ability.modifiers.special.value < 0 ? '-' : '+';
    showSpecial = false;
  }
  /**
   * @type {import('svelte/elements').FormEventHandler<HTMLInputElement>}
   */
  function onkeydown(e) {
    let valueBeforeKey = e.currentTarget.value;

    if (e.key === 'Backspace' && valueBeforeKey === '') {
      operationSign = '';
    }

    if (e.key === '+' || e.key === '-') {
      e.preventDefault();
      operationSign = e.key;
    }
  }
</script>

<Input
  class={`${cssClass} ability final`}
  value={showSpecial ? ability.base : ability.final}
  type="text"
  readonly
  {disabled}
  onclick={e => {
    e.currentTarget.blur();
    showSpecial = !showSpecial;
  }}
/>
{#if showSpecial}
  <Input
    class={`${cssClass} ability operator`}
    value={operationSign}
    type="text"
    readonly
    {disabled}
  />
  <Input
    class={`${cssClass} ability special`}
    value={Math.abs(ability.modifiers.special?.value) ?? 0}
    type="text"
    onfocus={e => e.currentTarget.select()}
    {onchange}
    {onkeydown}
    {disabled}
    autofocus
  />
{/if}

<style lang="scss">
  @use 'card';
  :global(.card-input.ability.final) {
    cursor: pointer;
  }
  :global(.card-input.ability.final:disabled) {
    cursor: auto;
  }
  :global(.card-input.ability) {
    margin-right: -0.8em;
  }
</style>
