<script>
  import AttackDialog from '@module/combat/attackDialog.svelte';
  import { PhysicAttack } from '@module/combat/PhysicAttack.svelte';
  import CardMarker from '@svelte/ui/card/cardMarker.svelte';
  import CardMarkerCritic from '@svelte/ui/card/cardMarkerCritic.svelte';
  import IconSwitch from '@svelte/ui/iconSwitch.svelte';
  let { data, document } = $props();

  let attacker = game.scenes.active.tokens.getName('Killiam');
  let defender = game.scenes.active.tokens.getName('Mentalista');
  let attack = new PhysicAttack(attacker, defender);

  let expanded = $state(true);
</script>

<AttackDialog {attacker} {defender} />

<style lang="scss">
</style>
