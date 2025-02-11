<script>
  import MysticAttackDialog from '@svelte/components/mysticAttackDialog.svelte';
  import PhysicAttackDialog from '@svelte/components/physicAttackDialog.svelte';
  import PsychicAttackDialog from '@svelte/components/psychicAttackDialog.svelte';
  import CardTabbedCombat from '@svelte/ui/card/cardTabbedCombat.svelte';
  import { MysticAttack } from './MysticAttack.svelte';
  import { PhysicAttack } from './PhysicAttack.svelte';
  import { PsychicAttack } from './PsychicAttack.svelte';

  let { attacker, defender } = $props();

  // TODO: Implement logic and get right order for attacker/defender
  let tabs = [
    {
      label: 'attack',
      component: PhysicAttackDialog,
      props: { attack: new PhysicAttack(attacker, defender) }
    },
    {
      label: 'mystic',
      component: MysticAttackDialog,
      props: { attack: new MysticAttack(defender, attacker) }
    },
    {
      label: 'psychic',
      component: PsychicAttackDialog,
      props: { attack: new PsychicAttack(defender, attacker) }
    }
  ];
</script>

<CardTabbedCombat {tabs} />
