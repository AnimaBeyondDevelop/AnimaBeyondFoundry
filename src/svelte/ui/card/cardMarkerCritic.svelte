<script>
  import IconInput from '@svelte/ui/iconInput.svelte';
  import ModifiedAbilityInput from '@svelte/ui/modifiedAbilityInput.svelte';
  import InputLabel from '@svelte/ui/inputLabel.svelte';

  /**
   * @typedef {object} props
   * @property {import('@module/common/ModifiedAbility.svelte').ModifiedAbility} damage
   * @property {{primary: {value: string}, secondary: {value : string}}} critics
   * @property {string} selectedCritic
   * @property {{normal: string, expanded: string}} width
   * @property {boolean} [disabled]
   */

  /** @type {props} */
  let {
    damage = $bindable(),
    selectedCritic = $bindable(),
    critics,
    width,
    disabled
  } = $props();

  let expanded = $state(false);
  let currentWidth = $derived(expanded ? width.expanded : width.normal);
  let critic = selectedCritic;

  let availableCritics = $derived(
    critics ? [critics.secondary.value, critics.primary.value] : [critic]
  );
  // TODO: use ABFConfig.iterables instead
  let criticChoices = $derived(
    ['none', 'cut', 'impact', 'thrust', 'heat', 'electricity', 'cold', 'energy'].sort(
      (a, b) =>
        availableCritics.findIndex(v => v === a) -
        availableCritics.findIndex(v => v === b)
    )
  );
  const i18n = /** @type {Localization} */ (game.i18n);
</script>

<div class="marker" style="--marker-width:{currentWidth}; --marker-border:5px;">
  <div class="body">
    {#each criticChoices as critic}
      {#if critic !== selectedCritic}
        <input
          class="icon"
          class:off={!availableCritics.includes(critic)}
          type="image"
          title={i18n.localize('anima.ui.combat.armors.at.' + critic + '.title')}
          onclick={() => {
            selectedCritic = critic;
            expanded = false;
          }}
          src={'/systems/animabf/assets/icons/svg/critic/' + critic + '.svg'}
          alt=""
        />
      {/if}
    {/each}
    <InputLabel
      label={'anima.ui.combat.armors.at.' + selectedCritic}
      icon={'critic/' + selectedCritic}
      oniconClick={() => (expanded = !expanded)}
    >
      <ModifiedAbilityInput bind:ability={damage} {disabled} />
    </InputLabel>
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
