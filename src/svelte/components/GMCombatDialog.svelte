<script>
  // @ts-nocheck
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import { GMCombatManager } from '@module/combat/manager/GMCombatManager.svelte.js';
  import Card from '@svelte/ui/card/card.svelte';
  import Button from '@svelte/ui/button.svelte';
  import CardLabel from '@svelte/ui/card/cardLabel.svelte';
  import CardRibbon from '@svelte/ui/card/cardRibbon.svelte';
  import CardCircle from '@svelte/ui/card/cardCircle.svelte';
  import IconInput from '@svelte/ui/iconInput.svelte';
  import Input from '@svelte/ui/input.svelte';

  let { manager, close } = $props();
  const i18n = game.i18n;
  function clickEvent() {}
</script>

<div class="template">
  <div class="combat">
    <g class="background">
      <Card
        height="360px"
        width="740px"
        title="Modificadores"
        titlePosition={true}
        onClick={clickEvent}
        --transform-text="rotate(180deg)"
      ></Card></g
    >
    <div class="attacker">
      <span class="name">{manager.data.attacker.token.name}</span>
      <div class="ribbon">
        <CardRibbon width={manager.data.attacker.isReady ? '260px' : '0px'}
          ><span>
            {manager.data.attacker.result?.values.weapon?.name ??
              manager.data.attacker.result?.values.power?.name ??
              manager.data.attacker.result?.values.spell?.name ??
              i18n.format('macros.combat.dialog.unarmed.title')}</span
          ></CardRibbon
        >
      </div>
      <div class="circle"><CardCircle size="110px"></CardCircle></div>
      {#if manager.data.attacker.isReady}
        <div class="values">
          <IconInput
            icon="attack"
            value={manager.attack}
            bind:modifier={manager.attackModifiers.custom.modifier}
            title={i18n.localize('macros.combat.dialog.attack.title')}
            --icon-size="30px"
            --font-size="35px"
          />
          <IconInput
            icon={'critic/' + manager.data.attacker.result?.values.critic}
            value={manager.damage}
            bind:modifier={manager.damageModifiers.custom.modifier}
            title={i18n.localize(
              'anima.ui.combat.armors.at.' +
                manager.data.attacker.result?.values.critic +
                '.title'
            ) +
              ' - ' +
              i18n.localize('macros.combat.dialog.damage.title')}
            --icon-size="30px"
            --font-size="35px"
          />
        </div>
        <div class="dice">
          <IconInput
            icon="dice"
            value={manager.data.attacker.result?.values.roll}
            title={i18n.localize('macros.combat.dialog.rolled.title')}
            disabled
            --icon-size="30px"
            --font-size="35px"
          />
          {#if manager.data.attacker.result?.type === 'mystic'}
            <IconInput
              icon={'cast-' + manager.data.attacker.result?.values.castMethod}
              title={i18n.localize(
                `dialogs.castSpell.${manager.data.attacker.result?.values.castMethod}.title`
              )}
              disabled
              --icon-size="30px"
            />
          {/if}
          {#if manager.data.attacker.result?.type === 'psychic'}
            <IconInput
              icon="psychic-potential"
              value={manager.data.attacker.result?.values.psychicPotential}
              title={i18n.localize('anima.ui.psychic.psychicPotential.potential.title')}
              disabled
              --icon-size="30px"
              --font-size="35px"
            />
          {/if}
        </div>
        <div class="total">
          <CardLabel height="50px" width="180px"
            ><Input
              value={manager.attack + manager.data.attacker.result?.values.roll}
              disabled
            /></CardLabel
          >
        </div>
      {/if}
    </div>
    <div class="divider"></div>
    <div class="defender">
      <span class="name">{manager.data.defender.token.name}</span>
      <div class="ribbon">
        <CardRibbon width={manager.data.defender.isReady ? '260px' : '0px'}
          ><span
            >{manager.data.defender.result?.values.power?.name ??
              manager.data.defender.result?.values.spell?.name ??
              i18n.localize(
                `macros.combat.dialog.defenseType.${manager.data.defender.result?.values.type}.title`
              )}
          </span></CardRibbon
        >
      </div>
      <div class="circle"><CardCircle size="110px"></CardCircle></div>
      {#if manager.data.defender.isReady}
        <div class="values">
          <IconInput
            icon="defense"
            value={manager.defense}
            bind:modifier={manager.defenseModifiers.custom.modifier}
            title={i18n.localize('macros.combat.dialog.defense.title')}
            --icon-size="30px"
            --font-size="35px"
          />
          <IconInput
            icon="armor"
            value={manager.armor}
            bind:modifier={manager.armorModifiers.custom.modifier}
            title={i18n.localize('anima.ui.combat.finalArmor.title')}
            --icon-size="30px"
            --font-size="35px"
          />
        </div>
        <div class="dice">
          <IconInput
            icon="dice"
            value={manager.data.defender.result?.values.roll}
            title={i18n.localize('macros.combat.dialog.rolled.title')}
            disabled
            --icon-size="30px"
            --font-size="35px"
          />
          {#if manager.data.defender.result?.type === 'mystic'}
            <IconInput
              icon={'cast-' + manager.data.defender.result?.values.castMethod}
              title={i18n.localize(
                `dialogs.castSpell.${manager.data.defender.result?.values.castMethod}.title`
              )}
              disabled
              --icon-size="30px"
            />
          {/if}
          {#if manager.data.defender.result?.type === 'psychic'}
            <IconInput
              icon="psychic-potential"
              value={manager.data.defender.result?.values.psychicPotential}
              title={i18n.localize('anima.ui.psychic.psychicPotential.potential.title')}
              disabled
              --icon-size="30px"
              --font-size="35px"
            />
          {/if}
        </div>
        <div class="total">
          <CardLabel height="50px" width="180px"
            ><Input
              value={manager.defense + manager.data.defender.result?.values.roll}
              disabled
            /></CardLabel
          >
        </div>
      {/if}
    </div>
    <div class="close">
      <CardCircle
        ><IconCheckBox
          icon="plus"
          title={i18n.localize('macros.combat.dialog.closeButton.title')}
          onClick={() => manager.close()}
          noStyle
          --transform="rotate(45deg)"
          --icon-size="25px"
        /></CardCircle
      >
    </div>
  </div>
  <div class="modifiers">
    <g class="background">
      <Card
        height="300px"
        width="660px"
        edge="20px"
        sidebar="20px"
        --transform-text="rotate(180deg)"
      ></Card></g
    >
  </div>
  <div class="result">
    <g class="background">
      <Card
        height="300px"
        width="740px"
        title="Resultado"
        titlePosition={true}
        --transform="rotate(180deg)"
      ></Card>
      <div class="confirm">
        <CardLabel
          ><Button
            title={i18n.localize('macros.combat.dialog.confirmButton.title')}
            onClick={() => manager.applyValues()}
          /></CardLabel
        >
      </div></g
    >
  </div>
</div>

<style lang="scss">
  :global(:root) {
    --background-color: black;
    --main-color: rgb(184, 184, 184);
    --secondary-color: rgb(45, 45, 45);
    --light-color: white;
    --main-text-color: black;
    --secondary-text-color: white;
  }
  .template {
    height: 300px;
    width: 500px;
    display: grid;
    gap: 30px;

    .combat {
      height: 360px;
      width: 740px;
      display: grid;
      grid-template: 1fr 40px / 1fr 40px 1fr;
      position: relative;
    }
    .close {
      position: absolute;
      right: -35px;
      top: -30px;
    }
    .attacker {
      height: 320px;
      z-index: 1;
      grid-area: 1/1;
      display: grid;
      grid-template: 1.2fr 1.5fr 1fr 1fr 1.2fr / 65px 1fr;
      gap: 5px;
      .name {
        grid-area: 1/2;
      }
      .ribbon {
        grid-area: 2/2;
        span {
          margin-left: 35px;
        }
      }
      .circle {
        grid-area: 1 / 1 / 3 / 3;
        align-self: center;
        margin-left: 20px;
        margin-top: 30px;
      }
      .values {
        grid-area: 3/2;
        display: flex;
      }
      .dice {
        grid-area: 4/2;
        display: flex;
      }
      .total {
        grid-area: 5/2;
        justify-self: center;
      }
    }
    .divider {
      grid-area: 1/2;
      place-self: center;
      width: 15px;
      height: 324px;
      background-color: var(--secondary-color);
      border: 5px solid var(--background-color);
      z-index: 1;
    }
    .defender {
      height: 320px;
      z-index: 1;
      grid-area: 1/3;
      display: grid;
      grid-template: 1.2fr 1.5fr 1fr 1fr 1.2fr / 1fr 65px;
      gap: 5px;
      .name {
        grid-area: 1/1;
      }
      .ribbon {
        grid-area: 2/1;
        justify-self: end;
        span {
          margin-right: 35px;
        }
      }
      .circle {
        grid-area: 1 / 1 / 3 / 3;
        align-self: center;
        justify-self: end;
        margin-right: 20px;
        margin-top: 30px;
      }
      .values {
        grid-area: 3/1;
        display: flex;
      }
      .dice {
        grid-area: 4/1;
        display: flex;
      }
      .total {
        grid-area: 5/1;
        justify-self: center;
      }
    }
    .name {
      font-size: 1.5rem;
      font-weight: bold;
      align-self: center;
      justify-self: center;
    }
    .ribbon span {
      font-size: 1.5rem;
    }
    .modifiers {
      justify-self: center;
      margin-top: -60px;
      z-index: -1;
    }
    .result {
      height: 300px;
      width: 740px;
      display: grid;
      grid-template: 40px 1fr 3fr / 65px 1fr 65px;
      gap: 5px;
      position: relative;
      .background {
        align-self: end;
      }
    }
    .confirm {
      position: absolute;
      right: -27px;
      bottom: -28px;
    }
  }
  .background {
    grid-area: 1 / 1 / -1 / -1;
    justify-self: end;
  }
</style>
