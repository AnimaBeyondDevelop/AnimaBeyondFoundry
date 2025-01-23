<script>
  // @ts-nocheck
  import CardSelect from '@svelte/ui/card/cardSelect.svelte';
  import IconInput from '@svelte/ui/iconInput.svelte';
  import Input from '@svelte/ui/input.svelte';
  import CardMarkerCritic from '@svelte/ui/card/cardMarkerCritic.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import Button from '@svelte/ui/button.svelte';
  import CardLabel from '@svelte/ui/card/cardLabel.svelte';
  import CardCircle from '@svelte/ui/card/cardCircle.svelte';
  import CardCombat from '@svelte/ui/card/cardCombat.svelte';
  import IconSwitch from '@svelte/ui/iconSwitch.svelte';
  import ModifiedAbilityInput from '@svelte/ui/modifiedAbilityInput.svelte';
  import InputLabel from '@svelte/ui/inputLabel.svelte';

  let { attack, sendAttack } = $props();
  const i18n = game.i18n;

  async function onAttack() {
    if (!attack.canCast) return;

    await attack.roll();
    attack.toMessage();
    sendAttack(attack);
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
  <div class="box"></div>
  <g class="select">
    <CardSelect bind:value={attack.spell} options={attack.availableSpells} />
  </g>
  <g class="marker">
    <CardMarkerCritic
      bind:damage={attack.damage}
      bind:selectedCritic={attack.critic}
      width={markerWidth}
    />
  </g>
  <g class="primary">
    <InputLabel label="anima.ui.mystic.magicProjection.final.title" icon="mystic">
      <ModifiedAbilityInput bind:ability={attack.ability} />
    </InputLabel>
  </g>
  <div class="secondary">
    <InputLabel
      label="macros.combat.dialog.zeonCost.title"
      icon="zeon-cost"
      --icon-size="45px"
    >
      <Input value={attack.zeonCost} disabled={true} />
    </InputLabel>
  </div>
  <g class="upper-left">
    <InputLabel
      label="macros.combat.dialog.zeonAccumulated.title"
      icon="zeon-accumulated"
      --icon-size="40px"
    >
      <Input value={attack.zeonAccumulated} disabled={true} />
    </InputLabel>
  </g>
  <div class="spell-grade">
    {#each attack.availableSpellGrades as spellGrade, i}
      <input
        class={attack.spellGrade === spellGrade ? 'selected' : ''}
        title={i18n.localize(`macros.combat.dialog.spellGrade.${spellGrade}.title`)}
        type="image"
        src={`/systems/animabf/assets/icons/svg/spell-${spellGrade}.svg`}
        alt={spellGrade}
        onclick={() => (attack.spellGrade = spellGrade)}
        style={i < 2 ? '--icon-size:26px' : ''}
      />
    {/each}
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
    <CardLabel
      ><Button
        title={i18n.localize('macros.combat.dialog.button.attack.title')}
        onClick={onAttack}
      /></CardLabel
    >
  </div>
  <div class="circle-cast-method">
    <CardCircle>
      <IconSwitch
        icons={['cast-accumulated', 'cast-prepared', 'cast-innate', 'cast-override']}
        bind:value={attack.castMethod}
        options={['accumulated', 'prepared', 'innate', 'override']}
        title={i18n.localize(`dialogs.castSpell.${attack.castMethod}.title`)}
        --icon-size="30px"
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
    .circle-distance {
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
