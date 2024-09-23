<script>
  // @ts-nocheck
  import IconInput from '@svelte/ui/iconInput.svelte';
  let {
    value,
    modifier = $bindable(0),
    critics = $bindable(),
    markerWidth,
    onChange,
    disabled
  } = $props();
  let width = $state(markerWidth.min);

  let criticChoices = [
    'none',
    'cut',
    'impact',
    'thrust',
    'heat',
    'electricity',
    'cold',
    'energy'
  ];
  const i18n = game.i18n;

  function selectCritic(critic) {
    critics.selected = critic;
    width = markerWidth.min;
    onChange?.(critic);
  }

  function expandMarker() {
    if (width === markerWidth.max) {
      width = markerWidth.min;
    } else {
      width = markerWidth.max;
    }
  }
</script>

<div class="marker" style="--marker-width:{width}; --marker-border:5px;">
  <div class="body">
    {#each criticChoices as critic, i}
      {#if critic !== critics.selected && critic !== critics.primary && (critics.secondary === 'none' || critic !== critics.secondary)}
        <input
          class="icon off"
          type="image"
          title={i18n.localize('anima.ui.combat.armors.at.' + critic + '.title')}
          onclick={() => selectCritic(critic)}
          src={'/systems/animabf/assets/icons/svg/critic/' + critic + '.svg'}
          alt=""
        />
      {/if}
    {/each}
    {#if critics.secondary && critics.secondary !== critics.selected && critics.secondary !== 'none'}
      <input
        class="icon"
        type="image"
        title={i18n.localize('anima.ui.combat.armors.at.' + critics.secondary + '.title')}
        onclick={() => selectCritic(critics.secondary)}
        src={'/systems/animabf/assets/icons/svg/critic/' + critics.secondary + '.svg'}
        alt=""
      />
    {/if}
    {#if critics.primary && critics.primary !== critics.selected}
      <input
        class="icon"
        type="image"
        title={i18n.localize('anima.ui.combat.armors.at.' + critics.primary + '.title')}
        onclick={() => selectCritic(critics.primary)}
        src={'/systems/animabf/assets/icons/svg/critic/' + critics.primary + '.svg'}
        alt=""
      />
    {/if}
    <IconInput
      icon={'critic/' + critics.selected}
      {value}
      bind:modifier
      clickEvent={expandMarker}
      title={i18n.localize('anima.ui.combat.armors.at.' + critics.selected + '.title')}
      {disabled}
    />
  </div>
</div>

<style lang="scss">
  .marker {
    height: 80px;
    width: var(--marker-width, 150px);
    position: relative;
    background: black;
    clip-path: polygon(37px 0, 100% 0, 100% 100%, 37px 100%, 0 40px);
    transition: width 1s ease-in-out;

    .body {
      display: grid;
      grid-template: 1fr / repeat(7, 30px) 130px;
      gap: 8px;
      justify-content: end;
      place-items: center;
      height: 70px;
      width: calc(var(--marker-width, 150px) - var(--marker-border) * 2);
      position: absolute;
      top: 5px;
      left: 5px;
      background: rgb(45, 45, 45);
      clip-path: polygon(35px 0, 100% 0, 100% 100%, 35px 100%, 3px 35px);
      transition: width 1s ease-in-out;
      z-index: -1;

      .icon {
        height: 35px;
        justify-self: center;
        transition: scale 0.3s ease-out;
        &:hover {
          scale: 1.05;
        }
        &.off {
          opacity: 60%;
        }
      }
    }
  }
</style>
