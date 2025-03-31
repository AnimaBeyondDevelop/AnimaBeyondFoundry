<script>
  // @ts-nocheck
  import CardSelect from '@svelte/ui/card/cardSelect.svelte';
  import IconInput from '@svelte/ui/iconInput.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import CardCombat from '@svelte/ui/card/cardCombat.svelte';
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
    <CardSelect options={[]}
      ><option value="resistance"
        >{i18n.format('macros.combat.dialog.attackType.resistance.title')}</option
      ></CardSelect
    >
  </g>
  <g class="marker">
    <CardMarker></CardMarker>
  </g>
  <div class="primary">
    <IconInput
      icon="armor"
      value={manager.armor}
      bind:modifier={manager.armorModifiers.special.modifier}
      title={i18n.localize('anima.ui.combat.finalArmor.title')}
      --icon-size="38px"
    />
  </div>
  <div class="bottom">
    <IconCheckBox
      icon="surprised"
      bind:value={manager.data.surprised}
      title={i18n.localize('macros.combat.dialog.surprised.title')}
      --icon-size="28px"
    />
  </div>
  <div class="button">
    <CardButton
      title={i18n.localize('macros.combat.dialog.button.defense.title')}
      onClick={() => manager.onDefense()}
    />
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
  }
</style>
