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
  const modifiers = Object.entries(ability.modifiers).filter(
    ([_, modifier]) => modifier.modifier !== 0 && modifier.active
  );
  const i18n = game.i18n;
</script>

<div>
  {#each modifiers as [key, modifier]}
    <div class={['modifier-row', cssClass].join(' ')}>
      <IconCheckBox
        icon={modifier.active ? 'checkbox_active' : 'checkbox_inactive'}
        bind:value={modifier.active}
        height="15px"
        {disabled}
      />
      <div class="modifier-label">
        <p>{i18n?.localize(`macros.combat.dialog.combatMod.${key}.title`)}</p>
        <Input value={modifier.modifier} disabled />
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  @use 'card';
  .modifier-row {
    --font-size: 16px;
    --icon-size: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: -10px;
    font-size: var(--font-size);
    & .modifier-label {
      display: flex;
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
