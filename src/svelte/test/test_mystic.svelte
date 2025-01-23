<script>
  import MysticAttackDialog from '@svelte/components/mysticAttackDialog.svelte';
  import { MysticAttack } from '@module/combat/MysticAttack.svelte';
  let { data, attacker, defender } = $props();

  function sendAttack(attack) {
    console.log(attack);
  }

  let attack = new MysticAttack(attacker, defender);
  console.log(attack);
  let v = $derived(attack.modifiers.secondaryCritic.value());
</script>

<MysticAttackDialog {attack} {sendAttack} />
<p>Thrown: {attack.isMelee}</p>
<p>Ranged: {attack.isRanged}</p>
