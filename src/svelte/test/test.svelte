<script>
  import { AttackDialog, PhysicAttack } from '@module/combat/attack';
  import { PhysicDefense } from '@module/combat/defense';
  import PhysicDefenseDialog from '@module/combat/defense/PhysicDefenseDialog.svelte';
  let { data, document } = $props();

  let attacker = game.scenes.active.tokens.getName('Mentalista');
  let defender = game.scenes.active.tokens.getName('Killiam');
  let defense = new PhysicDefense(new PhysicAttack(attacker, defender));

  let expanded = $state(true);
</script>

<AttackDialog {attacker} {defender} />
<div style="height:35px;"></div>
<PhysicDefenseDialog {defense} onDefend={v => console.log(v)} />

<style lang="scss">
</style>
