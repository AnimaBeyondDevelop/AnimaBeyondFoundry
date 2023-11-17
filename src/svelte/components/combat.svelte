<script>
  import TitledInput from '../ui/titledInput.svelte';
  import CustomSelect from '../ui/customSelect.svelte';

  export let data;

  let i18n = game.i18n;

  let selectedWeapon;
  $: selectedWeapon =
    $data.attacker.actor.system.combat.weapons.filter(
      weapon => weapon._id === $data.attacker.combat.weaponUsed
    )[0] || 'Unarmed';
</script>

<p>Svelte Combat!</p>
<TitledInput
  title={i18n.localize('macros.combat.dialog.modifier.title')}
  disabled={$data.attackSent}
  bind:value={$data.attacker.combat.modifier}
/>

{#if $data.ui.hasFatiguePoints}
  <CustomSelect
    title={i18n.localize('macros.combat.dialog.fatigue.title')}
    disabled={$data.attackSent}
    bind:value={$data.attacker.combat.fatigueUsed}
  >
    <option value={0}>0</option>
    {#each Array($data.attacker.actor.system.characteristics.secondaries.fatigue.value) as _, i}
      <option value={i + 1}>{i + 1}</option>
    {/each}
  </CustomSelect>
{:else}
  <p class="label no-fatigue">
    {i18n.localize('macros.combat.dialog.notEnoughFatigue.title')}
  </p>
{/if}

<CustomSelect
  title={i18n.localize('macros.combat.dialog.weapon.title')}
  disabled={$data.attacker.combat.unarmed || $data.attackSent}
  bind:value={$data.attacker.combat.weaponUsed}
>
  {#if $data.attacker.combat.unarmed}
    <option>Unarmed</option>
  {:else}
    {#each $data.attacker.actor.system.combat.weapons as weapon}
      <option value={weapon._id}>
        {i18n.format('macros.combat.dialog.weaponRow.attack.title', {
          name: weapon.name,
          value: weapon.system.attack.final.value
        })}
      </option>
    {/each}
  {/if}
</CustomSelect>

{#if !$data.attacker.combat.unarmed}
  <CustomSelect
    title={i18n.localize('macros.combat.dialog.weapon.critic.title')}
    disabled={!$data.ui.weaponHasSecondaryCritic || $data.attackSent}
    bind:value={$data.attacker.combat.criticSelected}
  >
    {#each Object.entries(selectedWeapon.system.critic) as [_, critic]}
      <option value={critic.value}
        >{i18n.localize(`anima.ui.combat.armors.at.${critic.value}.title`)}</option
      >
    {/each}
  </CustomSelect>
{/if}

<TitledInput
  title={i18n.localize('macros.combat.dialog.damage.title')}
  bind:value={$data.attacker.combat.damage.special}
  disabled={$data.attackSent}
  bind:secondaryValue={$data.attacker.combat.damage.final}
/>
