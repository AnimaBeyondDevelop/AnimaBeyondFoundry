<script>
  import CardSelect from '@svelte/ui/card/cardSelect.svelte';
  import IconRange from '@svelte/ui/iconRange.svelte';
  import CardMarkerCritic from '@svelte/ui/card/cardMarkerCritic.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import ModifiedAbilityInput from '@svelte/ui/modifiedAbilityInput.svelte';
  import InputLabel from '@svelte/ui/inputLabel.svelte';
  import CombatCard from '@svelte/ui/card/combatCard.svelte';
  import IconSwitch from '@svelte/ui/iconSwitch.svelte';

  /**
   * @typedef {import(".").PhysicAttack} PhysicAttack
   * @typedef props
   * @property {PhysicAttack} attack
   * @property {() => void} onAttack Function called when hitting
   * the attack button.
   */

  /** @type {props} */
  let { attack, onAttack } = $props();
  const i18n = /** @type {ReadyGame} */ (game).i18n;

  let fatigueAvailable = attack.attacker.system.characteristics.secondaries.fatigue.value;
  let togglePanel = $state(false);
  // TODO: expanded sidebar 210px (i.e. 150px bigger). Width should be updated accordingly

  let distanceOptions = [
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
  ];
  let throwOptions = [
    {
      value: false,
      icon: 'no-throw',
      title: i18n.localize('macros.combat.dialog.melee.title')
    },
    {
      value: true,
      icon: 'throw',
      title: i18n.localize('macros.combat.dialog.throw.title')
    }
  ];

  function onAttackClick() {
    attack.attacker.setLastWeaponUsed(attack.weapon, 'offensive');
    onAttack();
  }
</script>

<CombatCard>
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
          options={distanceOptions}
          bind:value={attack.meleeCombat}
          style="light"
        />
      </div>
    {/if}
    <div id="main-button">
      <CardButton shape="angled" onclick={onAttackClick} style="light" class="main">
        {i18n.localize('macros.combat.dialog.button.attack.title')}
      </CardButton>
      {#if attack.isThrownable}
        <IconSwitch
          shape="circle"
          options={throwOptions}
          bind:value={attack.thrown}
          style="light"
          class="secondary"
        />
      {/if}
    </div>
  {/snippet}
  {#snippet sidebar()}
    <div></div>
    <div></div>
    <!-- 

    Código Necesario para el update de ataques específicos.
    Agrande el tamaño de la CardCombat dando la ilusión de que la barra lateral se expande.

    <IconCheckBox
      icon="arrow"
      bind:value={togglePanel}
      title={togglePanel ?  i18n.localize('anima.ui.togglePanel.close.title') :  i18n.localize('anima.ui.togglePanel.open.title')}
      invert={true}
      noStyle={true}
      --icon-size="30px"
      --icon-margin="-5px"
      --transform={!togglePanel ? 'scaleX(-1)' : ''}
    /> -->
  {/snippet}
  {#snippet top()}
    <div class="row pull-right">
      <IconRange
        icon="fatigue"
        bind:value={attack.ability.modifiers.fatigue.value}
        maxValue={Math.min(fatigueAvailable, 5)}
        title={i18n?.localize('macros.combat.dialog.fatigue.title') +
          ` (${fatigueAvailable})`}
      />
    </div>
    <div class="row justify">
      <InputLabel
        label={i18n?.localize('macros.combat.dialog.attack.title')}
        icon="attack"
        useIcon
      >
        <ModifiedAbilityInput bind:ability={attack.ability} />
      </InputLabel>
      <div class="right-icons">
        <IconCheckBox
          icon="high-ground"
          bind:value={attack.ability.modifiers.highGround.value}
          title={i18n.localize('macros.combat.dialog.highGround.title')}
        />
        {#if !attack.meleeCombat && attack.isRanged}
          <IconCheckBox
            icon="target-in-cover"
            bind:value={attack.ability.modifiers.targetInCover.value}
            title={i18n.localize('macros.combat.dialog.targetInCover.title')}
          />
          <IconCheckBox
            icon="poor-visibility"
            bind:value={attack.ability.modifiers.poorVisibility.value}
            title={i18n.localize('macros.combat.dialog.poorVisibility.title')}
          />
        {/if}
      </div>
    </div>
  {/snippet}
  {#snippet selector()}
    <CardSelect bind:value={attack.weapon} options={attack.availableWeapons} />
  {/snippet}
  {#snippet marker()}
    <CardMarkerCritic
      bind:damage={attack.damage}
      bind:selectedCritic={attack.critic}
      critics={attack.weapon.system.critic}
    />
  {/snippet}
</CombatCard>
