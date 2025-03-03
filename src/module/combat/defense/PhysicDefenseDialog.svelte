<script>
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import CardMarker from '@svelte/ui/card/cardMarker.svelte';
  import CardSelect from '@svelte/ui/card/cardSelect.svelte';
  import CombatCard from '@svelte/ui/card/combatCard.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import IconRange from '@svelte/ui/iconRange.svelte';
  import IconSwitch from '@svelte/ui/iconSwitch.svelte';
  import InputLabel from '@svelte/ui/inputLabel.svelte';
  import ModifiedAbilityInput from '@svelte/ui/modifiedAbilityInput.svelte';

  /**
   * @typedef {import(".").PhysicDefense} PhysicDefense
   * @typedef props
   * @property {PhysicDefense} defense
   * @property {() => void} onDefend Function called when hitting the defend button.
   */

  /** @type {props} */
  let { defense, onDefend } = $props();
  const { defender } = defense;
  let fatigueAvailable = defender.system.characteristics.secondaries.fatigue.value;
  const i18n = /** @type {ReadyGame["i18n"]} */ (game.i18n);

  function onDefendClick() {
    defender.setLastWeaponUsed(defense.weapon, 'defensive');
    onDefend();
  }
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
    <div id="separator-button">
      <IconCheckBox
        shape="circle"
        icon="stack"
        bind:value={defense.autoAccumulateDefenses}
        style="light"
        title={i18n.localize('macros.combat.dialog.combat.accumulateDefenses.title')}
      />
    </div>
    <div id="main-button">
      <CardButton shape="angled" onclick={onDefendClick} style="light" class="main">
        {i18n.localize(
          `macros.combat.dialog.defenseType.${defense.physicDefenseType}.title`
        )}
      </CardButton>
      <IconSwitch
        shape="circle"
        options={[
          {
            value: 'block',
            icon: 'switch',
            title: i18n.localize('macros.combat.dialog.block.title')
          },
          {
            value: 'dodge',
            icon: 'switch',
            title: i18n.localize('macros.combat.dialog.dodge.title')
          }
        ]}
        bind:value={defense.physicDefenseType}
        style="light"
        class="secondary"
      />
    </div>
  {/snippet}
  {#snippet top()}
    <div class="row pull-right">
      <IconRange
        icon="fatigue"
        bind:value={defense.ability.modifiers.fatigue.value}
        maxValue={Math.min(fatigueAvailable, 5)}
        title={i18n?.localize('macros.combat.dialog.fatigue.title') +
          ` (${fatigueAvailable})`}
      />
    </div>
    <div class="row pull-left">
      <InputLabel
        label={i18n?.localize('macros.combat.dialog.defend.title')}
        icon="defense"
        useIcon
      >
        <ModifiedAbilityInput bind:ability={defense.ability} />
      </InputLabel>
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
    <CardSelect bind:value={defense.weapon} options={defense.availableWeapons} />
  {/snippet}
  {#snippet marker()}
    <CardMarker>
      <IconSwitch
        options={[1, 2, 3, 4, 5].map(value => ({
          value: value - 1,
          icon: `defense-penalty-${value}`,
          title: i18n.localize('macros.combat.dialog.defenseCount.title') + ` (${value})`
        }))}
        bind:value={defense.ability.modifiers.cumulativeDefenses.value}
        class="secondary"
        height="100%"
        disabled={defense.autoAccumulateDefenses}
      />
      <input
        class="card-input"
        value={`${defense.ability.modifiers.cumulativeDefenses.value + 1}ª`}
        disabled
        title={i18n.localize('macros.combat.dialog.defenseCount.title')}
      />
    </CardMarker>
  {/snippet}
</CombatCard>

<style lang="scss">
  @use 'card';
</style>
