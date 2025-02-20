<script>
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import CardMarkerCritic from '@svelte/ui/card/cardMarkerCritic.svelte';
  import CardSelect from '@svelte/ui/card/cardSelect.svelte';
  import CombatCard from '@svelte/ui/card/combatCard.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import IconRange from '@svelte/ui/iconRange.svelte';
  import IconSwitch from '@svelte/ui/iconSwitch.svelte';
  import InputLabel from '@svelte/ui/inputLabel.svelte';
  import ModifiedAbilityInput from '@svelte/ui/modifiedAbilityInput.svelte';

  /**
   * @typedef {import(".").PsychicAttack} PsychicAttack
   * @typedef props
   * @property {PsychicAttack} attack
   * @property {() => void} onAttack Function called when hitting
   * the attack button.
   */

  /** @type {props} */
  let { attack, onAttack } = $props();
  const i18n = game.i18n;

  async function onPsychicPotential() {
    await attack.rollPotential();
    attack.potentialToMessage();
  }

  let togglePanel = $state(false);
</script>

<CombatCard>
  {#snippet top()}
    <div class="row pull-right">
      {#if attack.isPotentialRolled}
        <InputLabel
          icon="psychic"
          label={i18n.localize('anima.ui.psychic.psychicPoints.title') +
            ' ' +
            i18n.localize('anima.ui.psychic.psychicProjection.projection.title')}
          useIcon
        >
          <IconRange
            icon="psychic-point"
            bind:value={attack.ability.modifiers.cvs.value}
            maxValue={Math.min(attack.availablePsychicPoints, 5)}
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
            bind:value={attack.potential.modifiers.cvs.value}
            maxValue={Math.min(attack.availablePsychicPoints, 5)}
            title={i18n.localize('anima.ui.psychic.psychicPoints.title')}
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
          bind:ability={attack.ability}
          disabled={!attack.isPotentialRolled}
        />
      </InputLabel>

      <InputLabel
        label={i18n?.localize('anima.ui.psychic.psychicPotential.potential.title')}
        icon="psychic-potential"
        dimOnDisabled
        useIcon
      >
        <ModifiedAbilityInput
          bind:ability={attack.potential}
          disabled={attack.isPotentialRolled}
        />
      </InputLabel>
    </div>
  {/snippet}

  {#snippet selector()}
    <CardSelect bind:value={attack.power} options={attack.availablePowers} />
  {/snippet}
  {#snippet marker()}
    <CardMarkerCritic
      bind:damage={attack.damage}
      bind:selectedCritic={attack.critic}
      critics={{ primary: attack.power.system.critic }}
    />
  {/snippet}

  {#snippet bottom()}
    <div class="bottom-icons">
      <IconCheckBox
        icon="avoid-psychic-fatigue"
        bind:value={attack.preventFatigue}
        title={i18n.localize('macros.combat.dialog.eliminateFatigue.title')}
        disabled={attack.isPotentialRolled ||
          (!attack.preventFatigue && attack.availablePsychicPoints < 1)}
      />
      {#if attack.attacker.system.psychic.mentalPatterns.length > 0}
        <IconCheckBox
          icon="mental-pattern-imbalance"
          bind:value={attack.mentalPatternImbalance}
          title={i18n.localize('macros.combat.dialog.mentalPatternImbalance.title')}
          disabled={attack.isPotentialRolled}
        />
      {/if}
    </div>
  {/snippet}
  {#snippet buttons()}
    <div id="sidebar-button">
      <IconCheckBox
        icon="dice"
        bind:value={attack.withRoll}
        shape="circle"
        style="dark"
        title={i18n.localize(
          `macros.combat.dialog.${attack.withRoll ? 'withRoll' : 'withoutRoll'}.title`
        )}
      />
    </div>
    {#if !attack.distance && attack.isRanged}
      <div id="separator-button">
        <IconSwitch
          shape="circle"
          options={[
            {
              value: true,
              icon: 'point-blank',
              title: i18n.localize('macros.combat.dialog.pointBlank.title')
            },
            {
              value: false,
              icon: 'distance',
              title: i18n.localize('macros.combat.dialog.distance.title')
            }
          ]}
          bind:value={attack.meleeCombat}
          style="light"
        />
      </div>
    {/if}
    <div id="main-button">
      {#if attack.isPotentialRolled}
        <CardButton onclick={() => onAttack()} class="main" style="light" shape="angled">
          {i18n.localize('macros.combat.dialog.button.attack.title')}
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
  .bottom-icons {
    height: 30px;
    display: flex;
    gap: 10px;
  }
</style>
