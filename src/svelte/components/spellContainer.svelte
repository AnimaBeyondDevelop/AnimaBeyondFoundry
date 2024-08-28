<script>
  import Spell from '@svelte/components/spell.svelte';

  /** DataStore holding the ABFItemSheet data */
  export let data;
</script>

<Spell bind:spell={$data.item} />
