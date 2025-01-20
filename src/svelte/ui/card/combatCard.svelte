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
   * @property {Snippet} [marker]
   * @property {Snippet} [bottom]
   * @property {Snippet} [buttons]
   */

  import Card from '@svelte/ui/card/card.svelte';

  /** @type {Props} */
  let { sidebar, top, selector, marker, bottom, buttons } = $props();
  let topHeight = $state();
</script>

<!--
@component
Combat card component. It defines a card component with a body divided into a top,
selector (middle) and bottom regions. It also adds combat buttons around the card.

Notes:
- It expects top snippet to have divs with the .row css class, the last of which will be located right
on top of the selector.
- It expects buttons snippet to have elements with the #main-button, #separator-button and #sidebar-button
ids, which will render in the corresponding locations. They can be <div></div> elements.
- The #main-button element must contain a .main (card)button and can contain a .secondary element which will
be overlayed on the left side of the .main button.
- It reads styles from `./card.scss`, but their value can overwritten by passings custom css properties
to this component:
```tsx
  <CombatCard --width=300px --border-size=10px >
    {#snippet buttons()}
      <div id="sidebar-button">
        ...
      </div>
      <div id="separator-button">
        ...
      </div>
      <div id="main-button">
        <CardButton shape="angled" class="main" />
        <CardButton shape="circle" class="secondary" />
      </div>
    {/snippet}

    {#snippet selector()}
      ...
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
        <div class="top" bind:offsetHeight={topHeight}>{@render top?.()}</div>
        <div class="selector">{@render selector?.()}</div>
        <div class="bottom">{@render bottom?.()}</div>
      </div>
    {/snippet}
  </Card>

  <div class="marker-container" style:top={`${topHeight}px`}>{@render marker?.()}</div>

  <div class="buttons">
    {@render buttons?.()}
  </div>
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

  $selector-size: 60px;

  @mixin button-container($height) {
    justify-self: end;
    align-self: center;

    --height: #{$height};
    height: $height;
    width: fit-content;
  }

  .prueba {
    position: absolute;
    right: 0;
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
          padding: 10px;
          align-items: center;
          &:first-child {
            padding-right: calc(card.$edge-size - card.$border-size);
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
          height: $selector-size;
          flex-shrink: 0;
          display: flex;
        }
        .bottom {
          flex: 1;
          display: flex;
          flex-direction: row;
        }
      }
    }

    .right-icons {
      height: 35px;
      display: flex;
      flex-direction: row-reverse;
      gap: 10px;
      place-items: center;
    }

    .marker-container {
      position: absolute;
      right: calc(-2 * card.$border-size);
      --height: #{calc($selector-size + 2 * card.$border-size)};
    }

    .buttons :global {
      $height: var(--height);

      #sidebar-button {
        @include button-container(38px);
        position: absolute;
        left: calc(($border * 0.5) - $height / 2);
        bottom: calc($edge + ($border * 0.5) - $height / 2);
      }

      #separator-button {
        @include button-container(38px);
        position: absolute;
        bottom: calc(($border * 0.5) - $height / 2);
        left: calc($sidebar + ($border * 1.5) - $height / 2);
      }

      #main-button {
        @include button-container(60px);
        display: flex;
        flex-shrink: 0;
        align-items: center;
        position: absolute;
        bottom: calc(($border - $height) / 2);
        right: calc(($border - $height) / 2);
        .main {
          min-width: 200px;
        }
        .secondary {
          position: absolute;
          --height: 43px;
          left: calc(-0.2 * var(--height));
        }
      }
    }
  }
</style>
