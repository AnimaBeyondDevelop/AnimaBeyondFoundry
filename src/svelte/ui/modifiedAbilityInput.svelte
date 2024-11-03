<script>
  /**
   * @typedef {Object} props
   * @property {import("@module/common/ModifiedAbility.svelte").ModifiedAbility} ability
   * @property {string} title
   * @property {string} [icon]
   * @property {import('svelte/elements').MouseEventHandler<HTMLInputElement>} [oniconClick]
   * @property {boolean} [disabled]
   */

  /** @type {props} */
  let { ability = $bindable(), title, icon, oniconClick, disabled = false } = $props();

  let iconPath = $derived('/systems/animabf/assets/icons/svg/' + icon + '.svg');
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

<div class="content">
  {#if icon}
    <input
      class="icon"
      type="image"
      onclick={oniconClick}
      {title}
      src={iconPath}
      alt={title}
    />
  {/if}
  <input
    class="input"
    value={ability.final}
    type="text"
    onfocus={e => e.currentTarget.select()}
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
