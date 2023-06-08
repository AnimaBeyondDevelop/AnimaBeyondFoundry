<script>
  import TitledInput from "./titledInput.svelte";
  export let store;
</script>

<TitledInput title="Svelte mod" type="number" bind:secondaryValue={$store.attacker.combat.modifier} secondaryEnabled={false} bind:value={$store.attacker.combat.modifier}></TitledInput>
