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

  let { manager } = $props();
  const i18n = game.i18n;

  let markerWidth = { min: '150px', max: '435px' };
  let togglePanel = $state(false);
  let psychicPotentialRolled = $derived(manager.data.psychicPotentialRoll != undefined);
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
    {#if psychicPotentialRolled}
      <IconBox
        icon="psychic-point"
        bind:activeIcons={manager.data.psychicPoints.usedProjection}
        quantity={Math.min(
          manager.data.psychicPoints.available -
            manager.data.psychicPoints.usedPotential -
            manager.data.psychicPoints.eliminateFatigue,
          5
        )}
        onChange={value => manager.usePsychicPoints(value, 'psychicProjection')}
        title={i18n.localize('anima.ui.psychic.psychicPoints.title') +
          ` (${manager.data.psychicPoints.available})`}
      />
    {:else}
      <IconBox
        icon="psychic-point"
        bind:activeIcons={manager.data.psychicPoints.usedPotential}
        quantity={Math.min(
          manager.data.psychicPoints.available -
            manager.data.psychicPoints.usedProjection -
            manager.data.psychicPoints.eliminateFatigue,
          5
        )}
        onChange={value => manager.usePsychicPoints(value, 'psychicPotential')}
        title={i18n.localize('anima.ui.psychic.psychicPoints.title') +
          ` (${manager.data.psychicPoints.available})`}
        --transform="rotate(180deg)"
      />
    {/if}
    <IconCheckBox
      icon={psychicPotentialRolled ? 'psychic' : 'psychic-potential'}
      title={`${i18n.localize('anima.ui.psychic.psychicPoints.title')} ${
        psychicPotentialRolled
          ? i18n.localize('anima.ui.psychic.psychicProjection.projection.title')
          : i18n.localize('anima.ui.psychic.psychicPotential.potential.title')
      }`}
      disabled={true}
      noStyle={true}
      --icon-size="30px"
    />
  </div>
  <g class="select">
    <CardSelect
      bind:selection={manager.data.powerUsed}
      options={manager.data.psychicPowers}
      onChange={value => manager.onPowerChange(value)}
      disabled={psychicPotentialRolled}
      >{#if manager.data.psychicPowers.length === 0}
        <option>No Power Found</option>
      {/if}</CardSelect
    >
  </g>
  <g class="marker">
    <CardMarkerCritic
      value={manager.damage}
      bind:modifier={manager.damageModifiers.special.modifier}
      bind:critics={manager.data.critics}
      {markerWidth}
    />
  </g>
  <div class="primary">
    <IconInput
      icon="psychic"
      value={manager.attack}
      bind:modifier={manager.modifiers.special.modifier}
      title={i18n.localize('anima.ui.psychic.psychicProjection.projection.title')}
      disabled={!psychicPotentialRolled}
      --opacity={psychicPotentialRolled ? '' : '60%'}
    />
  </div>
  <div class="secondary">
    <IconInput
      icon="psychic-potential"
      value={manager.psychicPotential}
      bind:modifier={manager.potentialModifiers.special.modifier}
      title={i18n.localize('anima.ui.psychic.psychicPotential.potential.title')}
      disabled={psychicPotentialRolled}
      --opacity={psychicPotentialRolled ? '60%' : ''}
    />
  </div>
  <div class="bottom">
    <IconCheckBox
      icon="avoid-psychic-fatigue"
      bind:value={manager.data.eliminateFatigue}
      title={i18n.localize('macros.combat.dialog.eliminateFatigue.title')}
      disabled={manager.data.psychicPoints.available <=
        manager.data.psychicPoints.usedPotential +
          manager.data.psychicPoints.usedProjection || psychicPotentialRolled}
      onClick={value => manager.usePsychicPoints(value ? 1 : 0, 'eliminateFatigue')}
      --icon-size="30px"
    />
    <IconCheckBox
      icon="mental-pattern-imbalance"
      bind:value={manager.data.mentalPatternImbalance}
      title={i18n.localize('macros.combat.dialog.mentalPatternImbalance.title')}
      disabled={psychicPotentialRolled}
      --icon-size="28px"
    />
  </div>
  {#if !manager.data.distance.enable && manager.data.projectile.value}
    <div class="circle-distance">
      <CardCircle size="40px">
        <IconCheckBox
          icon={manager.data.distance.pointBlank ? 'point-blank' : 'distance'}
          bind:value={manager.data.distance.pointBlank}
          title={manager.data.distance.pointBlank
            ? i18n.localize('macros.combat.dialog.pointBlank.title')
            : i18n.localize('macros.combat.dialog.distance.title')}
          noStyle={true}
          --icon-size={manager.data.distance.pointBlank ? '15px' : '25px'}
        />
      </CardCircle>
    </div>
  {/if}
  <div class="button">
    {#if psychicPotentialRolled}
      <CardLabel
        ><Button
          title={i18n.localize('macros.combat.dialog.button.attack.title')}
          onClick={() => manager.onAttack()}
        /></CardLabel
      >
    {:else}
      <CardLabel
        ><Button
          title={i18n.localize('macros.combat.dialog.gm.psychicPotential.title')}
          onClick={() => manager.onPsychicPotential()}
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
