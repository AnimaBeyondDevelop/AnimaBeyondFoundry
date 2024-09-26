<script>
  // @ts-nocheck
  import CardSelect from '@svelte/ui/card/cardSelect.svelte';
  import IconInput from '@svelte/ui/iconInput.svelte';
  import IconBox from '@svelte/ui/iconBox.svelte';
  import CardMarkerCritic from '@svelte/ui/card/cardMarkerCritic.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import CardCircle from '@svelte/ui/card/cardCircle.svelte';
  import CardCombat from '@svelte/ui/card/cardCombat.svelte';

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
    <CardMarkerCritic
      value={manager.damage}
      bind:modifier={manager.damageModifiers.special.modifier}
      bind:critics={manager.data.critics}
      {markerWidth}
      onChange={value => manager.onCriticChange(value)}
    />
  </g>
  <g class="primary">
    <IconInput
      icon="attack"
      value={manager.attack}
      bind:modifier={manager.modifiers.special.modifier}
      title={i18n.localize('macros.combat.dialog.attack.title')}
    />
  </g>
  <div class="right-icons">
    <IconCheckBox
      icon="high-ground"
      bind:value={manager.data.highGround}
      title={i18n.localize('macros.combat.dialog.highGround.title')}
      onClick={value => {
        manager.addModifier('highGround', value);
      }}
      --icon-size="30px"
    />
    <IconCheckBox
      icon="target-in-cover"
      bind:value={manager.data.targetInCover}
      title={i18n.localize('macros.combat.dialog.targetInCover.title')}
      hidden={!manager.weapon?.system.isRanged.value || !manager.data.projectile.value}
      onClick={value => {
        manager.addModifier('targetInCover', value);
      }}
    />
    <IconCheckBox
      icon="poor-visibility"
      bind:value={manager.data.poorVisibility}
      title={i18n.localize('macros.combat.dialog.poorVisibility.title')}
      hidden={!manager.weapon?.system.isRanged.value || !manager.data.projectile.value}
      onClick={value => {
        manager.addModifier('poorVisibility', value);
      }}
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
          onClick={value => manager.distanceCheck(value)}
          --icon-size={manager.data.distance.pointBlank ? '15px' : '25px'}
        />
      </CardCircle>
    </div>
  {/if}
  <div class="button">
    <CardButton title={'Atacar'} onClick={() => manager.onAttack()} />
  </div>
  {#if manager.data.projectile.type === 'throw'}
    <div class="circle-throw">
      <CardCircle>
        <IconCheckBox
          icon={manager.data.projectile.value ? 'throw' : 'no-throw'}
          bind:value={manager.data.projectile.value}
          title={manager.data.projectile.value
            ? i18n.localize('macros.combat.dialog.throw.title')
            : i18n.localize('macros.combat.dialog.melee.title')}
          noStyle={true}
          --icon-size={manager.data.projectile.value ? '32px' : '22px'}
          --transform={manager.data.projectile.value ? 'rotate(360deg)' : 'rotate(0deg)'}
        />
      </CardCircle>
    </div>
  {/if}
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
