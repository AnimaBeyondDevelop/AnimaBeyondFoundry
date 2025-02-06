<script>
  import PhysicAttackDialog from '@svelte/components/physicAttackDialog.svelte';
  import MysticAttackDialog from '@svelte/components/mysticAttackDialog.svelte';
  import CardTabbedCombat from '@svelte/ui/card/cardTabbedCombat.svelte';
  import { PhysicAttack } from './PhysicAttack.svelte';
  import { MysticAttack } from './MysticAttack.svelte';

  let { attacker, defender } = $props();

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
    }
  ];
</script>

<CardTabbedCombat {tabs} />
