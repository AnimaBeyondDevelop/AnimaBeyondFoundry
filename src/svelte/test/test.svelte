<script>
  import PhysicAttackDialog from '@svelte/components/physicAttackDialog.svelte';
  import { PhysicAttack } from '@module/combat/PhysicAttack.svelte';
  let { data, attacker, defender } = $props();

  function sendAttack(attack) {
    console.log(attack);
  }

  let attack = new PhysicAttack(attacker, defender);
  console.log(attack);
  let v = $derived(attack.modifiers.secondaryCritic.value());
</script>

<PhysicAttackDialog {attack} {sendAttack} />
<p>Thrownable: {attack.isThrownable}</p>
<p>Projectile: {attack.isProjectile}</p>
<p>Thrown: {attack.thrown}</p>
<p>Ranged: {attack.isRanged}</p>
<p>ability.isSecondaryCritic: {attack.ability.modifiers.secondaryCritic.value}</p>
<p>modifiers.isSecondaryCritic: {v}</p>
