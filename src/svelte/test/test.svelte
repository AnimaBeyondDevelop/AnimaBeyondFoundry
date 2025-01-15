<script>
  import AttackDialog from '@module/combat/attackDialog.svelte';
  import { PhysicAttack } from '@module/combat/PhysicAttack.svelte';
  import CardMarker from '@svelte/ui/card/cardMarker.svelte';
  import CardMarkerCritic from '@svelte/ui/card/cardMarkerCritic.svelte';
  import IconSwitch from '@svelte/ui/iconSwitch.svelte';
  let { data, document } = $props();

  let attacker = game.actors.getName('Killiam');
  let defender = game.actors.getName('Kotarum');
  let attack = new PhysicAttack(attacker);

  let expanded = $state(true);
</script>

<AttackDialog {attacker} {defender} />

<style lang="scss">
</style>
