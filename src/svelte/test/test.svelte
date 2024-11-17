<script>
  import Card from '@svelte/ui/card/card.svelte';
  import CardMarker from '@svelte/ui/card/cardMarker.svelte';
  import { PhysicAttack } from '@module/combat/PhysicAttack.svelte';
  import CardCombat from '@svelte/ui/card/cardCombat.svelte';
  let { data, document } = $props();

  let expanded = $state(true);
  let { width, height } = $derived({
    width: expanded ? '500px' : '300px',
    height: '260px'
  });
</script>

<!---->
<Card --width={width} --height={height} --border-color="white">
  {#snippet sidebar()}
    <!-- <CardMarker --width="30px" --height="15px"/> -->
    a
  {/snippet}

  {#snippet body()}
    <h1>Patata</h1>
  {/snippet}

  {#snippet buttons()}
    <button class="arrow" onclick={() => (expanded = !expanded)}>Resize</button>
  {/snippet}
</Card>
