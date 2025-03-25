<script>
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import CardMarker from '@svelte/ui/card/cardMarker.svelte';
  import CardSelect from '@svelte/ui/card/cardSelect.svelte';
  import CombatCard from '@svelte/ui/card/combatCard.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import IconRange from '@svelte/ui/iconRange.svelte';
  import IconSwitch from '@svelte/ui/iconSwitch.svelte';
  import Input from '@svelte/ui/input.svelte';
  import InputLabel from '@svelte/ui/inputLabel.svelte';
  import ModifiedAbilityInput from '@svelte/ui/modifiedAbilityInput.svelte';

  /**
   * @typedef {import(".").PsychicDefense} PsychicDefense
   * @typedef props
   * @property {PsychicDefense} defense
   * @property {() => void} onDefend Function called when hitting
   * the defense button.
   */

  /** @type {props} */
  let { defense, onDefend } = $props();
  const i18n = game.i18n;

  async function onPsychicPotential() {
    await defense.rollPotential();
    defense.potentialToMessage();
  }
</script>

<CombatCard>
  {#snippet top()}
    <div class="row pull-right">
      {#if (defense.isPotentialRolled || !defense.newShield) && defense.psychicFatigue === undefined}
        <InputLabel
          icon="psychic"
          label={i18n.localize('anima.ui.psychic.psychicPoints.title') +
            ' ' +
            i18n.localize('anima.ui.psychic.psychicProjection.projection.title')}
          useIcon
        >
          <IconRange
            icon="psychic-point"
            bind:value={defense.ability.modifiers.cvs.value}
            maxValue={Math.min(defense.availablePsychicPoints, 5)}
            title={i18n.localize('anima.ui.psychic.psychicPoints.title')}
          />
        </InputLabel>
      {:else}
        <InputLabel
          icon="psychic-potential"
          label={i18n.localize('anima.ui.psychic.psychicPoints.title') +
            ' ' +
            i18n.localize('anima.ui.psychic.psychicPotential.potential.title')}
          useIcon
        >
          <IconRange
            icon="psychic-point"
            bind:value={defense.potential.modifiers.cvs.value}
            maxValue={Math.min(defense.availablePsychicPoints, 5)}
            title={i18n.localize('anima.ui.psychic.psychicPoints.title')}
            disabled={defense.isPotentialRolled}
          />
        </InputLabel>
      {/if}
    </div>

    <div class="row">
      <InputLabel
        label={i18n?.localize('anima.ui.psychic.psychicProjection.projection.title')}
        icon="psychic"
        dimOnDisabled
        useIcon
      >
        <ModifiedAbilityInput
          bind:ability={defense.ability}
          disabled={(!defense.isPotentialRolled && defense.newShield) ||
            defense.psychicFatigue !== undefined}
        />
      </InputLabel>
      {#if defense.newShield}
        <InputLabel
          label={i18n?.localize('anima.ui.psychic.psychicPotential.potential.title')}
          icon="psychic-potential"
          dimOnDisabled
          useIcon
        >
          <ModifiedAbilityInput
            bind:ability={defense.potential}
            disabled={defense.isPotentialRolled}
          />
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
      <CardSelect
        bind:value={defense.power}
        options={defense.availablePowers}
        disabled={defense.isPotentialRolled}
      />
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
      <div class="bottom-icons">
        {#if !defense.defender.system.psychic.psychicSettings.fatigueResistance}
          <IconCheckBox
            icon="avoid-psychic-fatigue"
            bind:value={defense.preventFatigue}
            title={i18n.localize('macros.combat.dialog.eliminateFatigue.title')}
            disabled={defense.isPotentialRolled ||
              (!defense.preventFatigue && defense.availablePsychicPoints < 1)}
          />
        {/if}
        {#if defense.defender.system.psychic.mentalPatterns.length > 0}
          <IconCheckBox
            icon="mental-pattern-imbalance"
            bind:value={defense.mentalPatternImbalance}
            title={i18n.localize('macros.combat.dialog.mentalPatternImbalance.title')}
            disabled={defense.isPotentialRolled}
          />
        {/if}
      </div>
    {/if}
  {/snippet}
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
    {#if !defense.isPotentialRolled && defense.availableSupernaturalShields.length > 0}
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
      {#if defense.isPotentialRolled || !defense.newShield}
        <CardButton onclick={() => onDefend()} class="main" style="light" shape="angled">
          {i18n.localize('macros.combat.dialog.button.defense.title')}
        </CardButton>
      {:else}
        <CardButton
          onclick={onPsychicPotential}
          class="main"
          style="light"
          shape="angled"
        >
          {i18n.localize('macros.combat.dialog.gm.psychicPotential.title')}
        </CardButton>
      {/if}
    </div>
  {/snippet}
</CombatCard>

<style lang="scss">
  @use 'card';
  .bottom-icons {
    height: 30px;
    display: flex;
    gap: 10px;
  }
</style>
