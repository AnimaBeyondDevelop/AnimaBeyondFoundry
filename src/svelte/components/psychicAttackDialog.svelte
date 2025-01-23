<script>
  // @ts-nocheck
  import CardSelect from '@svelte/ui/card/cardSelect.svelte';
  import IconInput from '@svelte/ui/iconInput.svelte';
  import IconBox from '@svelte/ui/iconBox.svelte';
  import CardMarkerCritic from '@svelte/ui/card/cardMarkerCritic.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import CardCircle from '@svelte/ui/card/cardCircle.svelte';
  import Button from '@svelte/ui/button.svelte';
  import CardLabel from '@svelte/ui/card/cardLabel.svelte';
  import CardCombat from '@svelte/ui/card/cardCombat.svelte';
  import ModifiedAbilityInput from '@svelte/ui/modifiedAbilityInput.svelte';
  import InputLabel from '@svelte/ui/inputLabel.svelte';

  let { attack, sendAttack } = $props();
  const i18n = game.i18n;

  async function onAttack() {
    await attack.roll();
    attack.toMessage();
    sendAttack(attack);
  }

  async function onPsychicPotential() {
    await attack.psychicRoll();
    attack.potentialToMessage();
  }

  let markerWidth = { normal: '150px', expanded: '435px' };
  let togglePanel = $state(false);
</script>

<div class="template">
  <g class="background">
    <CardCombat
      width={togglePanel ? '650px' : '500px'}
      sidebar={togglePanel ? '210px' : '60px'}
    ></CardCombat>
  </g>
  <div class="sidebar">
    <div></div>
    <div></div>
  </div>
  <div class="box">
    {#if attack.isPsychicRolled}
      <IconBox
        icon="psychic-point"
        bind:activeIcons={attack.ability.modifiers.psychicProjection.value}
        quantity={attack.availablePsychicPoints.projection}
        title={i18n.localize('anima.ui.psychic.psychicPoints.title')}
        --transform="rotate(180deg)"
      />
    {:else}
      <IconBox
        icon="psychic-point"
        bind:activeIcons={attack.potential.modifiers.psychicPotential.value}
        quantity={attack.availablePsychicPoints.potential}
        title={i18n.localize('anima.ui.psychic.psychicPoints.title')}
      />
    {/if}
    <IconCheckBox
      icon={attack.isPsychicRolled ? 'psychic' : 'psychic-potential'}
      title={`${i18n.localize('anima.ui.psychic.psychicPoints.title')} ${
        attack.isPsychicRolled
          ? i18n.localize('anima.ui.psychic.psychicProjection.projection.title')
          : i18n.localize('anima.ui.psychic.psychicPotential.potential.title')
      }`}
      disabled={true}
      noStyle={true}
      --icon-size="30px"
    />
  </div>
  <g class="select">
    <CardSelect bind:value={attack.power} options={attack.availablePowers} />
  </g>
  <g class="marker">
    <CardMarkerCritic
      bind:damage={attack.damage}
      bind:selectedCritic={attack.critic}
      width={markerWidth}
    />
  </g>
  <div class="primary">
    <InputLabel
      label="anima.ui.psychic.psychicProjection.projection.title"
      icon="psychic"
      --opacity={attack.isPsychicRolled ? '' : '60%'}
    >
      <ModifiedAbilityInput
        bind:ability={attack.ability}
        disabled={!attack.isPsychicRolled}
      />
    </InputLabel>
  </div>
  <div class="secondary">
    <InputLabel
      label="anima.ui.psychic.psychicPotential.potential.title"
      icon="psychic-potential"
      --opacity={attack.isPsychicRolled ? '60%' : ''}
    >
      <ModifiedAbilityInput
        bind:ability={attack.potential}
        disabled={attack.isPsychicRolled}
      />
    </InputLabel>
  </div>
  <div class="bottom">
    <IconCheckBox
      icon="avoid-psychic-fatigue"
      bind:value={attack.preventFatigue}
      title={i18n.localize('macros.combat.dialog.eliminateFatigue.title')}
      disabled={attack.availablePsychicPoints.preventFatigue === 0 ||
        attack.isPsychicRolled}
      --icon-size="30px"
    />
    <IconCheckBox
      icon="mental-pattern-imbalance"
      bind:value={attack.mentalPatternImbalance}
      title={i18n.localize('macros.combat.dialog.mentalPatternImbalance.title')}
      disabled={attack.isPsychicRolled}
      --icon-size="28px"
    />
  </div>
  {#if attack.distance == undefined && attack.isRanged}
    <div class="circle-distance">
      <CardCircle size="40px">
        <IconCheckBox
          icon={attack.inMelee ? 'point-blank' : 'distance'}
          bind:value={attack.inMelee}
          title={attack.inMelee
            ? i18n.localize('macros.combat.dialog.pointBlank.title')
            : i18n.localize('macros.combat.dialog.distance.title')}
          noStyle={true}
          --icon-size={attack.inMelee ? '15px' : '25px'}
        />
      </CardCircle>
    </div>
  {/if}
  <div class="button">
    {#if attack.isPsychicRolled}
      <CardLabel
        ><Button
          title={i18n.localize('macros.combat.dialog.button.attack.title')}
          onClick={onAttack}
        /></CardLabel
      >
    {:else}
      <CardLabel
        ><Button
          title={i18n.localize('macros.combat.dialog.gm.psychicPotential.title')}
          onClick={onPsychicPotential}
        /></CardLabel
      >
    {/if}
  </div>
</div>

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
      display: flex;
      gap: 20px;
      grid-area: 1 / 3 / 1 / -1;
      justify-self: end;
      align-self: center;
      margin-right: 40px;
      margin-top: 5px;
      z-index: 1;
      --gap: 8px;
      --opacity: 60%;
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

    .secondary {
      display: grid;
      grid-area: 2/3;
      place-self: end start;
      z-index: 1;
    }
    .bottom {
      display: flex;
      place-items: center;
      height: 40%;
      gap: 30px;
      margin-left: 20px;
      grid-area: 4/2;
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
  }
</style>
