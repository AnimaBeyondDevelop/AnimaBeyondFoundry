<script>
  import { slide, fly } from 'svelte/transition';
  import ModifiedAbilityInput from '@svelte/ui/modifiedAbilityInput.svelte';
  import InputLabel from '@svelte/ui/inputLabel.svelte';
  import CardMarker from './cardMarker.svelte';

  /**
   * @typedef {object} props
   * @property {import('@module/common/ModifiedAbility.svelte').ModifiedAbility} damage
   * @property {{primary: {value: string}, secondary: {value : string}}} critics
   * @property {string} selectedCritic
   * @property {boolean} [disabled]
   */

  /** @type {props} */
  let {
    damage = $bindable(),
    selectedCritic = $bindable(),
    critics,
    disabled
  } = $props();

  let expanded = $state(false);

  let availableCritics = $derived([critics.secondary.value, critics.primary.value]);
  // TODO: use ABFConfig.iterables instead
  let criticChoices = $derived(
    ['none', 'cut', 'impact', 'thrust', 'heat', 'electricity', 'cold', 'energy']
      .filter(c => c !== selectedCritic)
      .sort(
        (a, b) =>
          availableCritics.findIndex(v => v === a) -
          availableCritics.findIndex(v => v === b)
      )
  );
  const i18n = /** @type {Localization} */ (game.i18n);
</script>

<CardMarker>
  {#if expanded}
    <div
      class="selector-wrapper"
      in:slide={{ axis: 'x', duration: 400 }}
      out:slide={{ axis: 'x', duration: 400 }}
    >
      <div
        class="critic-select"
        in:fly={{ x: -100, duration: 400 }}
        out:fly={{ x: -100, duration: 400 }}
      >
        {#each criticChoices as critic}
          <InputLabel
            label={i18n.localize('anima.ui.combat.armors.at.' + critic)}
            icon={'critic/' + critic}
            oniconClick={() => {
              selectedCritic = critic;
              expanded = false;
            }}
            class={!availableCritics.includes(critic) ? 'off' : ''}
          />
        {/each}
      </div>
    </div>
  {/if}
  <InputLabel
    label="macros.combat.dialog.damage"
    icon={'critic/' + selectedCritic}
    iconLabel={'anima.ui.combat.armors.at.' + selectedCritic}
    oniconClick={() => (expanded = !expanded)}
  >
    <ModifiedAbilityInput bind:ability={damage} {disabled} />
  </InputLabel>
</CardMarker>

<style lang="scss">
  .critic-select {
    display: flex;
    place-items: center;
    :global {
      button {
        padding: 0px;
        height: 35px;
        justify-self: center;
        transition: scale 0.3s ease-out;
        &:hover {
          scale: 1.05;
        }
      }
      .off {
        opacity: 60%;
      }
    }
  }
</style>
