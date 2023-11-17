<script>
  export let data;
</script>

<p>Prueba! {$data.name}</p>
<input bind:value={$data.name} />
