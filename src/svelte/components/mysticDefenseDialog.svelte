<script>
  // @ts-nocheck
  import CardSelect from '@svelte/ui/card/cardSelect.svelte';
  import IconInput from '@svelte/ui/iconInput.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import CardCircle from '@svelte/ui/card/cardCircle.svelte';
  import CardCombat from '@svelte/ui/card/cardCombat.svelte';
  import IconSwitch from '@svelte/ui/iconSwitch.svelte';
  import CardMarker from '@svelte/ui/card/cardMarker.svelte';

  let { manager } = $props();
  const i18n = game.i18n;

  let markerWidth = { min: '150px', max: '435px' };
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
  <div class="box"></div>
  <g class="select">
    <CardSelect
      bind:selection={manager.data.spellUsed}
      options={manager.data.newShield
        ? manager.data.spells
        : manager.data.supernaturalShields}
      onChange={value => manager.onSpellChange(value)}
      >{#if manager.data.spells.length === 0}
        <option>No Spell Found</option>
      {/if}</CardSelect
    >
  </g>
  <g class="marker">
    <CardMarker>
      <div class="marker-content">
        <IconInput
          icon="supernatural-shield"
          value={manager.shieldPoints}
          title={i18n.localize('anima.ui.combat.supernaturalShields.shieldPoints.title')}
          invert={true}
          disabled={true}
        />
      </div>
    </CardMarker>
  </g>
  <g class="primary">
    <IconInput
      icon="mystic"
      value={manager.defense}
      bind:modifier={manager.modifiers.special.modifier}
      title={i18n.localize('anima.ui.mystic.magicProjection.final.title')}
    />
  </g>
  <div class="secondary">
    {#if manager.data.newShield}
      <IconInput
        icon="zeon-cost"
        value={manager.spellCasting.zeon.cost}
        title={i18n.localize('macros.combat.dialog.zeonCost.title')}
        disabled={true}
        --icon-size="45px"
      />
    {/if}
  </div>
  <g class="upper-left">
    <IconInput
      icon="zeon-accumulated"
      value={manager.spellCasting.zeon.accumulated}
      title={i18n.localize('macros.combat.dialog.zeonAccumulated.title')}
      disabled={true}
    />
  </g>
  <div class="spell-grade">
    {#if manager.data.newShield}
      {#each manager.attainableSpellGrades as spellGrade, i}
        <input
          class={manager.data.spellGrade === spellGrade ? 'selected' : ''}
          title={i18n.localize(`macros.combat.dialog.spellGrade.${spellGrade}.title`)}
          type="image"
          src={`/systems/animabf/assets/icons/svg/spell-${spellGrade}.svg`}
          alt={spellGrade}
          onclick={() => (manager.data.spellGrade = spellGrade)}
          style={i < 2 ? '--icon-size:26px' : ''}
        />
      {/each}
    {/if}
  </div>
  <div class="circle-new-shield">
    <CardCircle size="40px">
      <IconCheckBox
        icon="plus"
        bind:value={manager.data.newShield}
        title={i18n.localize('macros.combat.dialog.newShield.title')}
        onClick={value => manager.onNewShield(value)}
        --icon-size="18px"
      />
    </CardCircle>
  </div>
  <div class="button">
    <CardButton
      title={i18n.localize('macros.combat.dialog.button.defense.title')}
      onClick={() => manager.onDefense()}
    />
  </div>
  <div class="circle-cast-method">
    {#if manager.data.newShield}
      <CardCircle>
        <IconSwitch
          icons={['cast-accumulated', 'cast-prepared', 'cast-innate', 'cast-override']}
          bind:value={manager.castMethod}
          options={['accumulated', 'prepared', 'innate', 'override']}
          title={i18n.localize(`dialogs.castSpell.${manager.castMethod}.title`)}
          --icon-size="30px"
        />
      </CardCircle>
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

    .upper-left {
      display: grid;
      grid-area: 1/2;
      place-self: end start;
      z-index: 1;
    }
    .spell-grade {
      display: flex;
      grid-area: 4/2;
      height: 30px;
      margin-left: 10px;
      place-items: center;
      z-index: 1;
      input {
        width: var(--icon-size, 30px);
        height: var(--icon-size, 30px);
        margin-left: 10px;
        transition: scale 0.3s ease-out;
        opacity: 60%;
        &.selected {
          opacity: 1;
        }
        &:hover {
          scale: 1.05;
        }
      }
    }
    .button {
      grid-area: 4 / 3 / 5 / 5;
      justify-self: end;
      align-self: center;
      margin-right: -25px;
    }
    .circle-new-shield {
      grid-area: 4 / 1;
      justify-self: center;
      align-self: center;
      margin-right: -70px;
    }
    .circle-cast-method {
      grid-area: 4 / 3;
      justify-self: center;
      align-self: center;
      margin-right: -25px;
    }
  }
</style>
