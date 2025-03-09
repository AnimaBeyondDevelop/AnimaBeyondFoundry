<script>
  import { ABFActor } from '@module/actor/ABFActor';
  import Card from '@svelte/ui/card/card.svelte';
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import ContractibleCard from '@svelte/ui/card/contractibleCard.svelte';
  import InputLabel from '@svelte/ui/inputLabel.svelte';
  import ModifiersList from '@svelte/ui/modifiersList.svelte';
  import ModifiedAbilityInput from '@svelte/ui/modifiedAbilityInput.svelte';
  import { Attack } from '../attack';
  import { Defense, MysticDefense, PhysicDefense, PsychicDefense } from '../defense';
  import Input from '@svelte/ui/input.svelte';
  import { CombatResults } from './CombatResults.svelte';
  import IconSwitch from '@svelte/ui/iconSwitch.svelte';

  /**
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

  /** @type {CombatResults|undefined} */
  let combatResults = $state.raw();
  $effect(() => {
    if (attack.isRolled && defense.isRolled) {
      combatResults = new CombatResults(attack, defense);
    }
  });

  /** @type {number} */
  let titleHeight = $state(0);

  const i18n = /** @type {ReadyGame} */ (game).i18n;
</script>

{#snippet overview(/** @type {Attack | Defense} */ dataObject)}
  {@const actionType = dataObject instanceof Attack ? 'attack' : 'defense'}
  {@const actor = /** @type {ABFActor} */ (
    dataObject[actionType === 'attack' ? 'attacker' : 'defender']
  )}
  <h4>{actor.name}</h4>
  <div class="option-name" title={dataObject.displayName}>{dataObject.displayName}</div>
  {#await actor.getTokenImages() then images}
    <img src={images[0]} alt={actor.name} />
  {/await}
  {#if dataObject.rolled}
    {@const abilityName =
      dataObject instanceof PhysicDefense
        ? dataObject.physicDefenseType
        : dataObject.type + '.title'}
    <div class="row">
      <InputLabel
        icon={dataObject.type === 'physic' ? actionType : dataObject.type}
        label={i18n.localize(`macros.combat.dialog.gm.ability.${abilityName}.title`)}
        useIcon
      >
        <ModifiedAbilityInput bind:ability={dataObject.ability} />
      </InputLabel>
      {#if dataObject instanceof Attack}
        <InputLabel
          icon="critic/{dataObject.critic}"
          label={i18n.localize('macros.combat.dialog.damage')}
          iconLabel={i18n.localize(
            `anima.ui.combat.armors.at.${dataObject.critic}.title`
          )}
          useIcon
        >
          <ModifiedAbilityInput bind:ability={dataObject.damage} />
        </InputLabel>
      {:else}
        <InputLabel
          icon="armor"
          label={i18n.localize('macros.combat.dialog.at.title')}
          useIcon
        >
          <ModifiedAbilityInput bind:ability={dataObject.at} />
        </InputLabel>
      {/if}
    </div>
    <div class="row">
      <InputLabel
        icon="dice"
        label={i18n.localize('macros.combat.dialog.rolled.title')}
        useIcon
      >
        <Input
          value={dataObject.rolled}
          class={[
            dataObject.fumbled ? 'card-danger ' : '',
            dataObject.openRoll ? 'card-success' : ''
          ].join('')}
          disabled
        />
      </InputLabel>
    </div>
    <div class="total">
      <Input type="text" value={dataObject.finalAbility} disabled />
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
    <ContractibleCard
      title={i18n.localize('macros.combat.dialog.gm.modifiers.title')}
      bind:titleHeight
    >
      {#snippet body()}
        <div class="modifiers-container">
          <ModifiersList ability={attack.ability} />
          <ModifiersList ability={defense.ability} />
        </div>
      {/snippet}
    </ContractibleCard>
  </div>

  <Card
    slantedCorners="1 1 1 1"
    sidebarRight
    header={i18n.localize('macros.combat.dialog.gm.results.title')}
    --height="fit-content"
    class="result-card"
  >
    {#snippet body()}
      {#if combatResults}
        <h4>
          {combatResults.winner +
            ' ' +
            i18n.localize('macros.combat.dialog.winner.title')}
        </h4>
        {#if combatResults.totalDifference > 0}
          <!-- Results: attacker wins -->
          <div class="row">
            <InputLabel
              icon="attack"
              label={i18n.localize('macros.combat.dialog.difference.title')}
              showTitle="top"
              useIcon
            >
              <Input value={combatResults.totalDifference} disabled />
            </InputLabel>

            <InputLabel
              icon="critic/{attack.critic}"
              label={i18n.localize('macros.combat.dialog.damage.title')}
              showTitle="top"
              useIcon
            >
              <Input value={combatResults.damage} disabled />
            </InputLabel>
          </div>
        {:else}
          <!-- Results: defender wins -->
          <div class="row">
            <InputLabel
              icon="defense"
              label={i18n.localize('macros.combat.dialog.difference.title')}
              showTitle="top"
              useIcon
            >
              <Input value={-combatResults.totalDifference} disabled />
            </InputLabel>

            <!-- Results: counterattack -->
            {#if combatResults.canCounterAttack}
              <InputLabel
                icon="attack-bonus"
                label={i18n.localize('macros.combat.dialog.counterAttackBonus.title')}
                showTitle="top"
                useIcon
              >
                <Input value={combatResults.counterAttackBonus} disabled />
              </InputLabel>
            {/if}

            <!-- Results: supernatural shields -->
            {#if defense instanceof MysticDefense || defense instanceof PsychicDefense}
              <InputLabel
                label={i18n.localize(
                  'macros.combat.dialog.supernaturalShield.damage.title'
                )}
                showTitle="top"
              >
                {#snippet iconSnippet()}
                  <IconSwitch
                    bind:value={combatResults.supernaturalShieldDamageMultiplier}
                    options={['immune', 'normal', 'double'].map((name, value) => ({
                      value,
                      icon:
                        name === 'immune'
                          ? 'supernatural-shield'
                          : `supernatural-shield-${name}-damage`,
                      title: i18n.localize(
                        `macros.combat.dialog.supernaturalShield.${name}Damage.title`
                      )
                    }))}
                  />
                {/snippet}
                <Input
                  class={defense.shieldPoints <= combatResults.supernaturalShieldDamage
                    ? 'card-danger'
                    : ''}
                  value={combatResults.supernaturalShieldDamage}
                  disabled
                />
              </InputLabel>
            {/if}
          </div>
        {/if}
      {:else}
        Loading...
      {/if}
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

  .results {
    display: flex;
    flex-direction: column;

    .modifiers {
      --edge: calc(#{$main-sidebar-size} - #{$main-edge-size} + #{card.$border-size});
      --sidebar-size: calc(#{$main-sidebar-size} - #{$main-edge-size});
      --font-size: 28px;
      --height: 100%;
      --width: calc(100% - 2 * #{$main-edge-size});

      position: relative;
      left: $main-edge-size;
      top: calc(-1 * card.$title-height);
      & .modifiers-container {
        display: grid;
        width: 100%;
        grid-template-columns: 1fr 1fr;
        padding-left: 20px;
        padding-top: 5px;
        gap: 20px;
      }
    }
    .result.row {
      display: flex;
    }
    :global {
      .main-card {
        .card-body {
          display: flex;
          height: calc(100% - card.$title-height + card.$border-size);
          & > div {
            position: relative;
            background-color: card.$background-color;
            display: flex;
            flex: 1;
            gap: 10px;
            text-align: center;
            flex-direction: column;
            place-items: center;
            min-width: 0;

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
              white-space: nowrap;
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
                @include borders.slanted-edges(
                  0 0 1 0,
                  $bg-color: card.$background-light
                );
                padding-left: 40px;
                padding-right: 25px;
              }
            }
            &.defense {
              img {
                right: calc(-0.33 * $img-height);
                top: calc(0.2 * $img-height);
              }
              .option-name {
                @include borders.slanted-edges(
                  0 0 0 1,
                  $bg-color: card.$background-light
                );
                padding-right: 40px;
                padding-left: 25px;
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

      .result-card {
        .card-body {
          padding-bottom: 10px;
          display: flex;
          flex-direction: column;
          place-items: center;

          .row {
            width: 85%;
            display: flex;
            justify-content: space-evenly;
            flex-direction: row;
          }
        }
      }
    }
  }
</style>
