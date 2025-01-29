<script>
  import { slide } from 'svelte/transition';
  import Card from './card.svelte';

  /**
   * @import { ComponentProps, Snippet } from 'svelte';
   * @typedef {Omit<ComponentProps<typeof Card>,"header"|"footer"|"slantedCorners">} CardProps
   *
   * @typedef {Object} Props
   * @property {"up"|"down"} [direction=down] Direction on which the card should expand.
   * @property {boolean} [expanded=false]
   * @property {Snippet|string} title Title text or snippet to render the hide/show button.
   */

  /** @type {Props&CardProps} */
  let { direction = 'down', expanded = $bindable(false), title, ...rest } = $props();

  let titleHeight = $state();
</script>

<!--
@component
Contractible card component. It defines an (all corners) slanted card shape with a button as a header/footer
which toggles visibility for the rest of the card.

Notes:
- It reads styles from `./card.scss`, but their value can overwritten by passings custom css properties
to this component:
```tsx
  <ContractibleCard {body} {sidebar} --border-size=5px title="Hide me!" />
```
```tsx
  <Card --edge=30px --border-size=10px >
    {#snippet sidebar()}
      <Icon name="dice" />
    {/snippet}

    {#snippet body()}
      <h1> Card title </h1>
    {/snippet}

    {#snippet title()}
      <Icon name="attack" --height="30px" />
      Results
    {/snippet}
  </Card>
```
-->
<div
  class="contractible-card direction-{direction}"
  style="--title-height: {titleHeight}px;"
>
  {#if expanded}
    <div in:slide={{ axis: 'y', duration: 400 }} out:slide={{ axis: 'y', duration: 400 }}>
      <Card slantedCorners="1 1 1 1" sidebarRight {...rest} />
    </div>
  {/if}
  <button
    class="title"
    onclick={() => (expanded = !expanded)}
    bind:offsetHeight={titleHeight}
  >
    {#if typeof title === 'string'}
      {title}
    {:else}
      {@render title()}
    {/if}
  </button>
</div>

<style lang="scss">
  @use 'card';
  @use 'borders';

  $title-height: var(--title-height);

  .contractible-card {
    min-height: $title-height;
    position: relative;
    .title {
      @include card.text(dark);
      @include card.buttonlike();

      width: card.$card-width;
      min-height: $title-height;
      text-align: center;

      display: flex;
      place-content: center;
    }
  }

  .direction-down {
    .title {
      @include borders.slanted-edges(1 1 0 0, $bg-color: card.$background-light);
      position: absolute;
      top: 0;
    }

    :global {
      .card-body {
        padding-top: $title-height;
      }
      .sidebar {
        padding-top: $title-height;
      }
    }
  }
  .direction-up {
    .title {
      @include borders.slanted-edges(0 0 1 1, $bg-color: card.$background-light);
      position: absolute;
      bottom: 0;
    }
    :global {
      .card-body {
        padding-bottom: $title-height;
      }
      .sidebar {
        padding-bottom: $title-height;
      }
    }
  }
</style>
