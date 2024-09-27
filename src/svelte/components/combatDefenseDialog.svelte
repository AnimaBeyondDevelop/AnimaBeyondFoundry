<script>
  // @ts-nocheck
  import CardSelect from '@svelte/ui/card/cardSelect.svelte';
  import IconInput from '@svelte/ui/iconInput.svelte';
  import IconBox from '@svelte/ui/iconBox.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import CardCircle from '@svelte/ui/card/cardCircle.svelte';
  import CardCombat from '@svelte/ui/card/cardCombat.svelte';
  import CardMarker from '@svelte/ui/card/cardMarker.svelte';
  import IconSwitch from '@svelte/ui/iconSwitch.svelte';
  import Input from '@svelte/ui/Input.svelte';

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
  <div class="box">
    <IconBox
      icon="fatigue"
      bind:activeIcons={manager.data.fatigue.used}
      quantity={Math.min(manager.data.fatigue.available, 5)}
      onChange={value => manager.addModifier('fatigue', value)}
      title={i18n.localize('macros.combat.dialog.fatigue.title') +
        ` (${manager.data.fatigue.available})`}
    />
  </div>
  <g class="select">
    <CardSelect
      bind:selection={manager.data.weaponUsed}
      options={manager.data.weapons}
      onChange={value => manager.onWeaponChange(value)}
      ><option value="unarmed">{i18n.format('macros.combat.dialog.unarmed.title')}</option
      ></CardSelect
    >
  </g>
  <g class="marker">
    <CardMarker>
      <div class="marker-content">
        <IconSwitch
          icons={[
            'defense-penalty-1',
            'defense-penalty-2',
            'defense-penalty-3',
            'defense-penalty-4',
            'defense-penalty-5'
          ]}
          options={[0, 1, 2, 3, 4]}
          bind:value={manager.data.defenseCounter.accumulated}
          title={i18n.localize('macros.combat.dialog.defenseCount.title')}
          invert={true}
          onClick={value => manager.addMultipleDefensesPenalty(value)}
          --icon-size="40px"
        />
        <Input value={manager.data.defenseCounter.accumulated + 1 + 'º'} disabled={true} />
      </div>
    </CardMarker>
  </g>
  <g class="primary">
    <IconInput
      icon="defense"
      value={manager.defense}
      bind:modifier={manager.modifiers.special.modifier}
      title={i18n.localize('macros.combat.dialog.defend.title')}
    />
  </g>
  <div class="secondary">
    <IconInput
      icon="armor"
      value={manager.armor}
      bind:modifier={manager.armorModifiers.special.modifier}
      title={i18n.localize('anima.ui.combat.finalArmor.title')}
      --icon-size="38px"
    />
  </div>
  <div class="circle-stack">
    <CardCircle size="40px">
      <IconCheckBox
        icon="stack"
        bind:value={manager.data.defenseCounter.keepAccumulating}
        title={i18n.localize('macros.combat.dialog.combat.accumulateDefenses.title')}
        --icon-size="20px"
      />
    </CardCircle>
  </div>
  <div class="button">
    <CardButton
      title={i18n.localize(
        `macros.combat.dialog.defenseType.${manager.data.defenseType}.title`
      )}
      onClick={() => manager.onDefense()}
    />
  </div>
  <div class="circle-switch">
    <CardCircle>
      <IconSwitch
        icons={['switch', 'switch']}
        options={['block', 'dodge']}
        bind:value={manager.data.defenseType}
        title={i18n.localize('macros.combat.dialog.throw.title')}
        onClick={manager.onWeaponChange()}
        noStyle={true}
        --icon-size="22px"
        --transform={manager.data.defenseType === 'block' ? 'scaleY(1)' : 'scaleY(-1)'}
      />
    </CardCircle>
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
      .marker-content {
        display: grid;
        grid-template-columns: 20px 1fr;
        align-items: center;
      }
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

    .button {
      grid-area: 4 / 3 / 5 / 5;
      justify-self: end;
      align-self: center;
      margin-right: -25px;
    }
    .circle-stack {
      grid-area: 4 / 1;
      justify-self: center;
      align-self: center;
      margin-right: -70px;
    }
    .circle-switch {
      grid-area: 4 / 3;
      justify-self: center;
      align-self: center;
      margin-right: -25px;
    }
  }
</style>
