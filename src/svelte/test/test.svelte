<script>
  import Card from '@svelte/ui/card/card.svelte';
  import CardMarker from '@svelte/ui/card/cardMarker.svelte';
  import { PhysicAttack } from '@module/combat/PhysicAttack.svelte';
  import CardCombat from '@svelte/ui/card/cardCombat.svelte';
  let { data, document } = $props();

  let expanded = $state(false);
  let { width, height } = $derived({
    width: expanded ? '500px' : '300px',
    height: '260px'
  });
</script>

<!---->
<!-- <Card --width={width} --height={height}> -->
<!--   {#snippet sidebar()} -->
<!--     <CardMarker --width="30px" --height="15px"/> -->
<!--   {/snippet} -->
<!---->
<!--   {#snippet body()} -->
<!--     <h1>Patata</h1> -->
<!--   {/snippet} -->
<!---->
<!--   {#snippet buttons()} -->
<!--     <button>Click</button> -->
<!--   {/snippet} -->
<!-- </Card> -->

<button onclick={() => (expanded = !expanded)}>Resize</button>
