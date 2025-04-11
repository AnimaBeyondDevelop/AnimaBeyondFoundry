<script>
  import CardSelect from '@svelte/ui/card/cardSelect.svelte';
  import CardMarker from '@svelte/ui/card/cardMarker.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import IconSwitch from '@svelte/ui/iconSwitch.svelte';
  import Input from '@svelte/ui/input.svelte';
  import ModifiedAbilityInput from '@svelte/ui/modifiedAbilityInput.svelte';
  import InputLabel from '@svelte/ui/inputLabel.svelte';
  import CombatCard from '@svelte/ui/card/combatCard.svelte';
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import IconSelect from '@svelte/ui/iconSelect.svelte';
  import ModifiersList from '@svelte/ui/modifiersList.svelte';

  /**
   * @typedef {import(".").MysticDefense} MysticDefense
   * @typedef props
   * @property {MysticDefense} defense
   * @property {() => void} onDefend Function called when hitting
   * the defense button.
   */

  /** @type {props} */
  let { defense, onDefend } = $props();
  const i18n = game.i18n;
</script>

<CombatCard>
  {#snippet buttons()}
    <div id="sidebar-button">
      <IconCheckBox
        icon="dice"
        bind:value={defense.withRoll}
        shape="circle"
        style="dark"
        title={i18n.localize(
          `macros.combat.dialog.${defense.withRoll ? 'withRoll' : 'withoutRoll'}.title`
        )}
      />
    </div>
    {#if defense.availableSupernaturalShields.length > 0}
      <div id="separator-button">
        <IconCheckBox
          icon="plus"
          bind:value={defense.newShield}
          shape="circle"
          style="light"
          title={i18n.localize(`macros.combat.dialog.newShield.title`)}
        />
      </div>
    {/if}
    <div id="main-button">
      <CardButton shape="angled" onclick={() => onDefend()} style="light" class="main">
        {i18n.localize('macros.combat.dialog.button.defense.title')}
      </CardButton>
      {#if defense.newShield}
        <IconSwitch
          shape="circle"
          options={['accumulated', 'prepared', 'innate', 'override'].map(method => ({
            value: method,
            icon: `cast-${method}`,
            title: i18n.localize(`dialogs.castSpell.${method}.title`)
          }))}
          bind:value={defense.castMethod}
          style="light"
          class="secondary"
        />
      {/if}
    </div>
  {/snippet}
  {#snippet top()}
    {#if defense.newShield}
      <div class="row pull-left">
        <InputLabel
          label={i18n?.localize('macros.combat.dialog.zeonAccumulated.title')}
          icon="zeon-accumulated"
          useIcon
        >
          <Input value={defense.zeonAccumulated || 0} disabled />
        </InputLabel>
      </div>
    {/if}
    <div class="row pull-left">
      <InputLabel
        label={i18n?.localize('anima.ui.mystic.magicProjection.final.title')}
        icon="mystic"
        useIcon
      >
        <ModifiedAbilityInput bind:ability={defense.ability} />
      </InputLabel>
      {#if defense.newShield}
        <InputLabel
          label={i18n?.localize('macros.combat.dialog.zeonCost.title')}
          icon="zeon-cost"
          useIcon
        >
          <Input value={defense.zeonCost} disabled />
        </InputLabel>
      {/if}
      <InputLabel
        label={i18n?.localize('macros.combat.finalArmor.title')}
        icon="armor"
        useIcon
      >
        <ModifiedAbilityInput bind:ability={defense.at} />
      </InputLabel>
    </div>
  {/snippet}
  {#snippet selector()}
    {#if defense.newShield}
      <CardSelect bind:value={defense.spell} options={defense.availableSpells} />
    {:else}
      <CardSelect
        bind:value={defense.supernaturalShield}
        options={defense.availableSupernaturalShields}
      />
    {/if}
  {/snippet}
  {#snippet marker()}
    <CardMarker>
      <InputLabel
        icon="supernatural-shield"
        label={i18n.localize('anima.ui.combat.supernaturalShields.shieldPoints.title')}
        useIcon
      >
        <Input
          value={defense.shieldPoints || 0}
          disabled
          title={i18n.localize('anima.ui.combat.supernaturalShields.shieldPoints.title')}
        />
      </InputLabel>
    </CardMarker>
  {/snippet}
  {#snippet bottom()}
    {#if defense.newShield}
      <IconSelect
        class="spell-grade"
        bind:value={defense.spellGrade}
        height="30px"
        options={defense.availableSpellGrades.map(grade => ({
          title: i18n.localize(`macros.combat.dialog.spellGrade.${grade}.title`),
          icon: `spell-${grade}`,
          value: grade
        }))}
      />
    {/if}
  {/snippet}
  {#snippet modifiers()}
    <ModifiersList ability={defense.ability} />
  {/snippet}
</CombatCard>

<style lang="scss">
  @use 'card';
</style>
