<script>
  /**
   * @import {Snippet} from 'svelte'
   * @import { FormEventHandler } from 'svelte/elements';
   *
   * @typedef {Object} AttackOption
   * @property {string} name
   *
   * @typedef {Object} ButtonSpec
   * @property {string} [text]
   * @property {string} [icon]
   * @property {FormEventHandler<HTMLButtonElement>} onclick
   *
   * @typedef {Object} CombatCardButton
   * @property {string} location
   * @property {ButtonSpec} props
   * @property {ButtonSpec} [secondary]
   *
   * @typedef {Object} Props
   * @property {Snippet} [sidebar]
   * @property {Snippet} [top]
   * @property {Snippet} [selector]
   * @property {Snippet} [bottom]
   * @property {CombatCardButton[]} buttons
   */

  import Card from '@svelte/ui/card/card.svelte';
  import CardButton from '@svelte/ui/card/cardButton.svelte';

  /** @type {Props} */
  let { sidebar, top, selector, bottom, buttons } = $props();
</script>

<!--
@component
Combat card component. It defines a card component with a body divided into a top,
selector (middle) and bottom regions. It also adds combat buttons around the card.

Notes:
- It expects top snippet to have divs with the .row css class, the last of which will be located right
on top of the selector.
- It reads styles from `./card.scss`, but their value can overwritten by passings custom css properties
to this component:
```tsx
  <script>
    const buttonSpecs = [
      { location: 'sidebar', props: { icon: 'dice', onclick: () => {} } },
      { location: 'separator', props: { icon: 'distance', onclick: () => {} } },
      {
        location: 'main',
        props: { text: 'Attack', onclick: () => {} },
        secondary: { icon: 'no-throw', onclick: () => {} }
      }
    ];
    let attackOptions = [{ name: 'Espada larga' }, { name: 'Descarga de luz' }];
    let selectedAttack = $state(attackOptions[0]);
  </script>
  <CombatCard {buttons} --width=300px --border-size=10px >
    {#snippet selector()}
      <CardSelect options={attackOptions} bind:value={selectedAttack} />
    {/snippet}

    {#snippet top()}
      <div class='row'>
        <h1> Attacking! </h1>
      </div>
    {/snippet}
  </CombatCard>
```
-->
<div class="card-container">
  <Card {sidebar}>
    {#snippet body()}
      <div class="body">
        <div class="top">{@render top?.()}</div>
        <div class="selector">{@render selector?.()}</div>
        <div class="bottom">{@render bottom?.()}</div>
      </div>
    {/snippet}
  </Card>

  {#each buttons as { location, secondary, props }}
    <div class={`button-${location}`}>
      <CardButton {...props} shape={location === 'main' ? 'angled' : 'circle'} />
      {#if secondary}
        <CardButton {...secondary} class="secondary" shape="circle" />
      {/if}
    </div>
  {/each}
</div>

<style lang="scss">
  @use 'card';
  @use 'borders';

  $height: card.$card-height;
  $width: card.$card-width;
  $edge: card.$edge-size;
  $sidebar: card.$sidebar-size;
  $border: card.$border-size;
  $border-color: card.$border-color;
  $bg-color: card.$background-color;
  $sidebar-color: card.$sidebar-color;

  @mixin button-container($height) {
    justify-self: end;
    align-self: center;

    --height: #{$height};
    height: $height;
    width: fit-content;
  }

  .card-container :global {
    width: fit-content;
    height: fit-content;
    position: relative;

    @include card.text();

    .content {
      .body {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;

        .row {
          display: flex;
          padding-inline: 10px;
          align-items: center;
          &:first-child {
            padding-right: card.$edge-size;
          }
          &:last-child {
            margin-top: auto;
          }
          & > div:last-of-type {
            margin-left: auto;
          }
        }
        .top {
          flex: 2;
          display: flex;
          flex-direction: column;
        }

        .selector {
          position: relative;
          height: 60px;
          flex-shrink: 0;
          display: flex;
          :global {
            .marker {
              position: absolute;
              right: calc(-2 * card.$border-size);
              top: calc(-1 * card.$border-size);
            }
          }
        }
        .bottom {
          flex: 1;
          display: flex;
          flex-direction: row;
        }
      }
    }

    .button-sidebar {
      @include button-container(32px);
      position: absolute;
      left: calc(($border * 0.2) - $height / 2);
      bottom: calc($edge + ($border * 1.5) - $height / 2);
    }

    .button-separator {
      @include button-container(32px);
      position: absolute;
      bottom: calc(($border * 1.5) - $height / 2);
      left: calc($sidebar + ($border * 1.5) - $height / 2);
    }

    .button-main {
      @include button-container(50px);
      display: flex;
      flex-shrink: 0;
      align-items: center;
      position: absolute;
      bottom: calc(($border - $height) / 2);
      right: calc(($border - $height) / 2);
      .secondary {
        position: absolute;
        left: -16px;
        --height: 38px;
      }
    }
  }
</style>
