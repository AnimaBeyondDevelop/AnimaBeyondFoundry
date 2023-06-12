<script>
  import { localize } from '../utils';
  import TitledInput from './titledInput.svelte';
  import CustomSelect from './customSelect.svelte';

  export let store;

  let selectedWeapon;
  $: selectedWeapon =
    $store.attacker.actor.data.data.combat.weapons.filter(
      weapon => weapon._id === $store.attacker.combat.weaponUsed
    )[0] || 'Unarmed';
</script>

<TitledInput
  title={localize('macros.combat.dialog.modifier.title')}
  disabled={$store.attackSent}
  bind:value={$store.attacker.combat.modifier}
/>

{#if $store.ui.hasFatiguePoints}
  <CustomSelect
    title={localize('macros.combat.dialog.fatigue.title')}
    disabled={$store.attackSent}
    bind:value={$store.attacker.combat.fatigueUsed}
  >
    <option value={0}>0</option>
    {#each Array($store.attacker.actor.data.data.characteristics.secondaries.fatigue.value) as _, i}
      <option value={i + 1}>{i + 1}</option>
    {/each}
  </CustomSelect>
{:else}
  <p class="label no-fatigue">{localize('macros.combat.dialog.notEnoughFatigue.title')}</p>
{/if}

<CustomSelect
  title={localize('macros.combat.dialog.weapon.title')}
  disabled={$store.attacker.combat.unarmed || $store.attackSent}
  bind:value={$store.attacker.combat.weaponUsed}
>
  {#if $store.attacker.combat.unarmed}
    <option>Unarmed</option>
  {:else}
    {#each $store.attacker.actor.data.data.combat.weapons as weapon}
      <option value={weapon._id}>
        {localize('macros.combat.dialog.weaponRow.attack.title', {
          name: weapon.name,
          value: weapon.data.attack.final.value
        })}
      </option>
    {/each}
  {/if}
</CustomSelect>

{#if !$store.attacker.combat.unarmed}
  <CustomSelect
    title={localize('macros.combat.dialog.weapon.critic.title')}
    disabled={!$store.ui.weaponHasSecondaryCritic || $store.attackSent}
    bind:value={$store.attacker.combat.criticSelected}
  >
    {#each Object.entries(selectedWeapon.data.critic) as [_, critic]}
      <option value={critic.value}>{localize(`anima.ui.combat.armors.at.${critic.value}.title`)}</option>
    {/each}
  </CustomSelect>
{/if}

<TitledInput
  title={localize('macros.combat.dialog.damage.title')}
  bind:value={$store.attacker.combat.damage.special}
  disabled={$store.attackSent}
  bind:secondaryValue={$store.attacker.combat.damage.final}
/>
