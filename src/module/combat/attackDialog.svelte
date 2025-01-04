<script>
  import PhysicAttackDialog from '@svelte/components/physicAttackDialog.svelte';
  import CardTabbedCombat from '@svelte/ui/card/cardTabbedCombat.svelte';
  import { PhysicAttack } from './PhysicAttack.svelte';

  let { attacker, defender } = $props();

  let tabs = [
    {
      label: 'attack',
      component: PhysicAttackDialog,
      props: { attack: new PhysicAttack(attacker) }
    },
    {
      label: 'mystic',
      component: PhysicAttackDialog,
      props: { attack: new PhysicAttack(defender) }
    }
  ];
</script>

<CardTabbedCombat {tabs} />
