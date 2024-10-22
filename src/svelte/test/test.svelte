<script>
  import TitledInput from '@svelte/ui/titledInput.svelte';
  let { data, document } = $props();
</script>

<h1>{document.name}</h1>
<TitledInput title="Nombre" type="text" bind:value={data.name}></TitledInput>
<TitledInput
  title="Agilidad"
  bind:value={data.system.characteristics.primaries.agility.value}
></TitledInput>
<button onclick={() => document.sheet.render(true)}>Click!</button>
