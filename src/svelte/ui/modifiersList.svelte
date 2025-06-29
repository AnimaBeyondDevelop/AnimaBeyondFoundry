<script>
  import IconCheckBox from './iconCheckBox.svelte';
  import Input from './input.svelte';

  /**
   * @typedef {Object} props
   * @property {import("@module/common/ModifiedAbility.svelte").ModifiedAbility} ability
   * @property {boolean} [disabled]
   * @property {string} [class] CSS class for the input element
   */

  /** @type {props} */
  let { ability = $bindable(), disabled = false, class: cssClass = '' } = $props();
  const i18n = game.i18n;
</script>

<div>
  {#each Object.entries(ability.modifiers).filter(([_, modifier]) => modifier.modifier !== 0) as [key, modifier]}
    <div class={['modifier-row', cssClass].join(' ')}>
      <IconCheckBox
        icon={modifier.active ? 'checkbox_active' : 'checkbox_inactive'}
        bind:value={modifier.active}
        height="15px"
        {disabled}
      />
      <div class={`modifier-label ${modifier.active ? '' : 'inactive'}`}>
        <p>{i18n?.localize(`macros.combat.dialog.combatMod.${key}.title`)}</p>
        <Input value={modifier.modifier} disabled />
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  @use 'card';
  .modifier-row {
    --font-size: 22px;
    --icon-size: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: -10px;
    font-size: 16px;
    & .modifier-label {
      display: flex;
      width: 100%;
      justify-content: space-between;
      padding-left: 5px;
      &.inactive {
        opacity: 60%;
      }
    }
  }
</style>
