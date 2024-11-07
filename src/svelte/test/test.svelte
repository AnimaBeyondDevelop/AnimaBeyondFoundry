<script>
  import PhysicAttackDialog from '@svelte/components/physicAttackDialog.svelte';
  import { PhysicAttack } from '@module/combat/PhysicAttack.svelte';
  let { data, document } = $props();

  function onAttack(attack) {
    console.log(attack);
  }

  let attack = new PhysicAttack(document);
  console.log(attack);
  let v = $derived(attack.modifiers.secondaryCritic.value());
</script>

<PhysicAttackDialog {attack} {onAttack} />
<p>Thrownable: {attack.isThrownable}</p>
<p>Projectile: {attack.isProjectile}</p>
<p>Thrown: {attack.thrown}</p>
<p>Ranged: {attack.isRanged}</p>
<p>ability.isSecondaryCritic: {attack.ability.modifiers.secondaryCritic.value}</p>
<p>modifiers.isSecondaryCritic: {v}</p>
