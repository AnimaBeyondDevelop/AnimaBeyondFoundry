<script>
  export let data;
</script>

<p>Prueba! {$data.data.name}</p>
<input bind:value={$data.data.name} />
