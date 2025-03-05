<script>
  import { ABFActor } from '@module/actor/ABFActor';
  import Card from '@svelte/ui/card/card.svelte';
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import ContractibleCard from '@svelte/ui/card/contractibleCard.svelte';
  import InputLabel from '@svelte/ui/inputLabel.svelte';
  import ModifiedAbilityInput from '@svelte/ui/modifiedAbilityInput.svelte';
  import { Attack } from './attack';
  import Input from '@svelte/ui/Input.svelte';

  /**
   * @import { Defense } from './defense';
   *
   * @typedef {Object} Props
   * @property {() => void} onClose Callback for hitting Close Button
   * @property {(bonus: number) => void} onCounterAttack Callback for hitting Counter Attack Button
   * @property {() => void} onApply Callback for hitting Apply Button
   * @property {Attack} attack
   * @property {Defense} defense
   * @property {number} [opacity=1]
   */

  /** @type {Props} */
  let { attack, defense, onApply, onCounterAttack, onClose, opacity = 1 } = $props();

  /** @type {number} */
  let titleHeight = $state(0);

  const i18n = game.i18n;
</script>

{#snippet overview(/** @type {Attack | Defense} */ dataObject)}
  {@const actionType = dataObject instanceof Attack ? 'attack' : 'defense'}
  {@const actor = /** @type {ABFActor} */ (
    dataObject[actionType === 'attack' ? 'attacker' : 'defender']
  )}
  <h4>{actor.name}</h4>
  <div class="option-name">{dataObject.displayName}</div>
  {#await actor.getTokenImages() then images}
    <img src={images[0]} alt={actor.name} />
  {/await}
  {#if dataObject.rolled}
    <div class="row">
      <InputLabel
        icon={dataObject.type === 'physic' ? actionType : dataObject.type}
        label={i18n?.localize(`macros.combat.dialog.gm.ability.${dataObject.type}.title`)}
        useIcon
      >
        <ModifiedAbilityInput bind:ability={dataObject.ability} />
      </InputLabel>
      {#if dataObject instanceof Attack}
        <InputLabel
          icon="critic/{dataObject.critic}"
          label={i18n?.localize('macros.combat.dialog.damage')}
          iconLabel={i18n?.localize(
            `anima.ui.combat.armors.at.${dataObject.critic}.title`
          )}
          useIcon
        >
          <ModifiedAbilityInput bind:ability={dataObject.damage} />
        </InputLabel>
      {:else}
        <InputLabel
          icon="armor"
          label={i18n?.localize('macros.combat.dialog.at.title')}
          useIcon
        >
          <ModifiedAbilityInput bind:ability={dataObject.at} />
        </InputLabel>
      {/if}
    </div>
    <div class="row">
      <InputLabel
        icon="dice"
        label={i18n?.localize('macros.combat.dialog.rolled.title')}
        useIcon
      >
        <Input
          value={dataObject.rolled}
          class={[
            dataObject.fumbled ? 'fumbled' : '',
            dataObject.openRoll ? 'open-roll' : ''
          ].join(' ')}
          disabled
        />
      </InputLabel>
    </div>
    <div class="total">
      <Input type="text" value={dataObject.total} disabled />
    </div>
  {:else}
    Loading...
  {/if}
{/snippet}

<div
  class="results"
  style:--title-height="{titleHeight}px"
  style:--width="700px"
  style:--height="300px"
  style:--edge="35px"
  style:--font-size="28px"
  style:opacity
>
  <Card slantedCorners="0 1 1 1" sidebarRight class="main-card">
    {#snippet body()}
      <div class="attack">{@render overview(attack)}</div>
      <div class="separator"></div>
      <div class="defense">{@render overview(defense)}</div>
    {/snippet}
  </Card>

  <div class="modifiers">
    <ContractibleCard title="Modificadores" bind:titleHeight>
      {#snippet body()}
        <div class="placeholder"></div>
      {/snippet}
    </ContractibleCard>
  </div>

  <Card slantedCorners="1 1 1 1" sidebarRight header="Resultado" --height="200px">
    {#snippet body()}
      <div class="placeholder"></div>
    {/snippet}
  </Card>

  <CardButton
    icon="times"
    shape="circle"
    height="35px"
    class="close-button"
    style="light"
    onclick={e => onClose(e)}
  />
</div>

<style lang="scss">
  @use 'card';
  @use 'borders';

  // General sizes
  $main-width: 700px;
  $main-height: 250px;
  $main-sidebar-size: calc($main-width / 12);
  $main-edge-size: 35px;

  .placeholder {
    height: 150px;
  }

  .fumbled {
    color: #f38ba8;
  }
  .open-roll {
    color: #a6e3a1;
  }

  .results {
    display: flex;
    flex-direction: column;

    .modifiers {
      --edge: calc(#{$main-sidebar-size} - #{$main-edge-size} + #{card.$border-size});
      --sidebar-size: calc(#{$main-sidebar-size} - #{$main-edge-size});
      --font-size: 28px;
      --height: 150px;
      --width: calc(100% - 2 * #{$main-edge-size});

      position: relative;
      left: $main-edge-size;
      top: calc(-1 * card.$title-height);
    }
    :global {
      .main-card {
        .card-body {
          display: flex;
          height: calc(100% - card.$title-height + card.$border-size);
          & > div {
            width: 50%;
            position: relative;
            background-color: card.$background-color;
            display: flex;
            flex: 1;
            gap: 10px;
            text-align: center;
            flex-direction: column;
            place-items: center;

            h4 {
              margin: 0;
            }
            $img-height: 85px;
            img {
              position: absolute;
              @include borders.circle($img-height);
            }
            .option-name {
              height: 50px;
              width: calc(100% - 40px);
              overflow: hidden;
              text-overflow: ellipsis;
              place-content: center;
            }
            .row {
              display: flex;
              width: 85%;
              & > :first-child {
                margin-right: auto;
              }
            }
            .total {
              @include borders.arrow-shape(50px, $bg-color: card.$background-light);
              min-width: 60%;
              align-content: center;
            }
            &.attack {
              img {
                left: calc(-0.33 * $img-height);
                top: calc(0.2 * $img-height);
              }
              .option-name {
                padding-left: 40px;
                padding-right: 25px;
                @include borders.slanted-edges(
                  0 0 1 0,
                  $bg-color: card.$background-light
                );
              }
            }
            &.defense {
              img {
                right: calc(-0.33 * $img-height);
                top: calc(0.2 * $img-height);
              }
              .option-name {
                padding-right: 40px;
                padding-left: 25px;
                @include borders.slanted-edges(
                  0 0 0 1,
                  $bg-color: card.$background-light
                );
              }
            }
          }
          .separator {
            background-color: card.$sidebar-color;
            min-width: calc(3 * card.$border-size);
            border-width: card.$border-size;
            border-style: none solid;
            flex-shrink: 0;
            flex-grow: 0;
          }
        }
      }

      .close-button {
        $height: var(--height, 50px);
        position: absolute;
        right: calc(-1 * $height/2);
        top: calc(-1 * $height/2);
      }
    }
  }
</style>
