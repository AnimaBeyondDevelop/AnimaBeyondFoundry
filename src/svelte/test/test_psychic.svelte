<script>
  import PsychicAttackDialog from '@svelte/components/psychicAttackDialog.svelte';
  import { PsychicAttack } from '@module/combat/PsychicAttack.svelte';
  let { data, attacker, defender } = $props();

  function sendAttack(attack) {
    console.log(attack);
  }

  let attack = new PsychicAttack(attacker, defender);
  console.log(attack);
  let v = $derived(attack.modifiers.secondaryCritic.value());
</script>

<PsychicAttackDialog {attack} {sendAttack} />
<p>Thrown: {attack.isMelee}</p>
<p>Ranged: {attack.isRanged}</p>
