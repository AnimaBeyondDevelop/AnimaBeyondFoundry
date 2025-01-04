<script>
  import CardSelect from '@svelte/ui/card/cardSelect.svelte';
  import IconBox from '@svelte/ui/iconBox.svelte';
  import CardMarkerCritic from '@svelte/ui/card/cardMarkerCritic.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import CardCircle from '@svelte/ui/card/cardCircle.svelte';
  import CardCombat from '@svelte/ui/card/cardCombat.svelte';
  import ModifiedAbilityInput from '@svelte/ui/modifiedAbilityInput.svelte';
  import InputLabel from '@svelte/ui/inputLabel.svelte';
  import CombatCard from '@svelte/ui/card/combatCard.svelte';

  /**
   * @typedef {import("@module/combat/PhysicAttack.svelte").PhysicAttack} PhysicAttack
   * @typedef props
   * @property {PhysicAttack} attack
   * @property {(attack: PhysicAttack) => void | Promise<void>} onAttack Function called when hitting
   * @property {boolean} [distanceAutomation] Whether distance automations are enabled or not
   * the attack button.
   */

  /** @type {props} */
  let { attack, onAttack, distanceAutomation = false } = $props();
  const i18n = game.i18n;

  let markerWidth = { normal: '150px', expanded: '435px' };
  let togglePanel = $state(false);
  let fatigueAvailable = attack.attacker.system.characteristics.secondaries.fatigue.value;
  // TODO: expanded sidebar 210px (i.e. 150px bigger). Width should be updated accordingly

  const buttons = [
    { location: 'sidebar', props: { icon: 'dice', onclick: () => {} } },
    { location: 'separator', props: { icon: 'distance', onclick: () => {} } },
    {
      location: 'main',
      props: { text: 'Attack', onclick: () => {} },
      secondary: { icon: 'no-throw', onclick: () => {} }
    }
  ];
</script>

<CombatCard {buttons}>
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
    <div class="box">
      <IconBox
        icon="fatigue"
        bind:activeIcons={attack.ability.modifiers.fatigue.value}
        quantity={Math.min(fatigueAvailable, 5)}
        title={i18n?.localize('macros.combat.dialog.fatigue.title') +
          ` (${fatigueAvailable})`}
      />
    </div>
    <div class="row">
      <div class="primary">
        <InputLabel label="macros.combat.dialog.attack" icon="attack">
          <ModifiedAbilityInput bind:ability={attack.ability} />
        </InputLabel>
      </div>
      <div class="right-icons">
        <IconCheckBox
          icon="high-ground"
          bind:value={attack.ability.modifiers.highGround.active}
          title={i18n.localize('macros.combat.dialog.highGround.title')}
          --icon-size="30px"
        />
        {#if attack.isRanged}
          <!-- TODO: Are this "hidden" needed? -->
          <IconCheckBox
            icon="target-in-cover"
            bind:value={attack.ability.modifiers.targetInCover.active}
            title={i18n.localize('macros.combat.dialog.targetInCover.title')}
            hidden={!attack.isRanged}
          />
          <IconCheckBox
            icon="poor-visibility"
            bind:value={attack.ability.modifiers.poorVisibility.active}
            title={i18n.localize('macros.combat.dialog.poorVisibility.title')}
            hidden={!attack.isRanged}
          />
        {/if}
      </div>
    </div>
  {/snippet}
  {#snippet selector()}
    <CardSelect bind:value={attack.weapon} options={attack.availableWeapons} />
    <g class="marker">
      <CardMarkerCritic
        bind:damage={attack.damage}
        bind:selectedCritic={attack.critic}
        critics={attack.weapon.system.critic}
        width={markerWidth}
      />
    </g>
  {/snippet}
  <!-- TODO: implement this logic.
  {#if !distanceAutomation && attack.isRanged}
    <div class="circle-distance">
      <CardCircle size="40px">
        <IconCheckBox
          icon={attack.ability.modifiers.pointBlank.active ? 'point-blank' : 'distance'}
          bind:value={attack.ability.modifiers.pointBlank.active}
          title={attack.ability.modifiers.pointBlank.active
            ? i18n.localize('macros.combat.dialog.pointBlank.title')
            : i18n.localize('macros.combat.dialog.distance.title')}
          noStyle={true}
          --icon-size={attack.ability.modifiers.pointBlank.active ? '15px' : '25px'}
        />
      </CardCircle>
    </div>
  {/if}
  <div class="button">
    <CardButton
      title={i18n.localize('macros.combat.dialog.button.attack.title')}
      onClick={() => onAttack(attack)}
    />
  </div>
  {#if attack.isThrownable}
    <div class="circle-throw">
      <CardCircle>
        <IconCheckBox
          icon={attack.thrown ? 'throw' : 'no-throw'}
          bind:value={attack.thrown}
          title={attack.thrown
            ? i18n.localize('macros.combat.dialog.throw.title')
            : i18n.localize('macros.combat.dialog.melee.title')}
          noStyle={true}
          --icon-size={attack.thrown ? '32px' : '22px'}
          --transform={attack.thrown ? 'rotate(360deg)' : 'rotate(0deg)'}
        />
      </CardCircle>
    </div>
  {/if}
  -->
</CombatCard>

<style lang="scss">
  .template {
    height: 300px;
    width: 500px;
    display: grid;
    grid-template: 2fr 2fr 2fr 2.8fr/65px 150px 150px 1fr;
    gap: 5px;

    .background {
      grid-area: 1 / 1 / -1 / -1;
      justify-self: end;
    }
    .box {
      grid-area: 1 / 3 / 1 / -1;
      justify-self: end;
      align-self: center;
      margin-right: 40px;
      margin-top: 5px;
      z-index: 1;
    }
    .select {
      grid-area: 3 / 1 / 4 /-1;
      justify-self: end;
      align-self: center;
    }
    .marker {
      grid-area: 3 / 1 / 4 /-1;
      justify-self: end;
      align-self: center;
      margin: -5px -5px 0;
      z-index: 1;
    }
    .marker {
      width: --marker-widht;
    }
    .sidebar {
      width: 60px;
      grid-area: 1 / 1 / span 4;
      place-self: start end;
      padding: 15px;
      display: grid;
      grid-template: 30px 30px 40px 55px 40px / 1fr;
      gap: 5px;
      place-items: center;
    }

    .primary {
      display: grid;
      grid-area: 2/2;
      place-self: end start;
      z-index: 1;
    }

    .right-icons {
      display: flex;
      flex-direction: row-reverse;
      width: 255px;
      grid-area: 2 / 3;
      margin-right: 15px;
      margin-bottom: -5px;
      gap: 10px;
      align-items: center;
      justify-content: end;
      z-index: 1;
    }

    .button {
      grid-area: 4 / 3 / 5 / 5;
      justify-self: end;
      align-self: center;
      margin-right: -25px;
    }
    .circle-distance {
      grid-area: 4 / 1;
      justify-self: center;
      align-self: center;
      margin-right: -70px;
    }
    .circle-throw {
      grid-area: 4 / 3;
      justify-self: center;
      align-self: center;
      margin-right: -25px;
    }
  }
</style>
